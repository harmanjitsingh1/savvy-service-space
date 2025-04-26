import React, { useState, useEffect } from "react";
import { ProviderLayout } from "@/components/provider/ProviderLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, Legend
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { BarChart2, HandCoins, List, Calendar, Users, Clock } from "lucide-react";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";
import { startOfMonth, endOfDay, subMonths, format, formatDistanceToNow } from "date-fns";

export default function ProviderDashboardPage() {
  const { user } = useAuth();
  
  // Initialize date range (default to current month)
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: endOfDay(new Date())
  });

  // State for recent bookings
  const [recentBookings, setRecentBookings] = useState<any[]>([]);

  // Function to format dates for queries
  const getQueryDateRange = () => {
    return {
      start: dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : format(subMonths(new Date(), 1), 'yyyy-MM-dd'),
      end: dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')
    };
  };

  // Stats query
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["providerStats", user?.id, dateRange],
    queryFn: async () => {
      if (!user) return null;
      
      const queryDates = getQueryDateRange();
      
      // Fetch services count
      const { data: services, error: servicesError } = await supabase
        .from("provider_services")
        .select("*", { count: "exact" })
        .eq("provider_id", user.id);
        
      if (servicesError) console.error("Error fetching services:", servicesError);
      
      // Fetch bookings count within date range
      const { data: bookings, error: bookingsError } = await supabase
        .from("bookings")
        .select("*", { count: "exact" })
        .eq("provider_id", user.id)
        .gte("booking_date", queryDates.start)
        .lte("booking_date", queryDates.end);
        
      if (bookingsError) console.error("Error fetching bookings:", bookingsError);
      
      // Fetch earnings total within date range
      const { data: earnings, error: earningsError } = await supabase
        .from("provider_earnings")
        .select("amount")
        .eq("provider_id", user.id)
        .gte("created_at", queryDates.start)
        .lte("created_at", queryDates.end);
        
      if (earningsError) console.error("Error fetching earnings:", earningsError);
      
      const totalEarnings = earnings?.reduce(
        (sum, earning) => sum + (earning.amount || 0),
        0
      ) || 0;
      
      return {
        servicesCount: services?.length || 0,
        bookingsCount: bookings?.length || 0,
        totalEarnings,
      };
    },
    enabled: !!user,
  });

  // Weekly data query for charts
  const { data: weeklyData } = useQuery({
    queryKey: ["weeklyData", user?.id, dateRange],
    queryFn: async () => {
      if (!user) return [];
      
      const queryDates = getQueryDateRange();
      
      // This would typically fetch real data from your database
      // For example, aggregate bookings by day of week
      const { data: bookingsData, error: bookingsError } = await supabase
        .from("bookings")
        .select("booking_date, total_amount")
        .eq("provider_id", user.id)
        .gte("booking_date", queryDates.start)
        .lte("booking_date", queryDates.end)
        .order("booking_date");
      
      if (bookingsError) {
        console.error("Error fetching weekly data:", bookingsError);
        return [];
      }
      
      // Process the data for charts
      // This is a simplified example - you might need more complex data processing
      const aggregatedData: Record<string, { bookings: number, revenue: number }> = {};
      
      bookingsData?.forEach(booking => {
        const day = format(new Date(booking.booking_date), 'EEE');
        if (!aggregatedData[day]) {
          aggregatedData[day] = { bookings: 0, revenue: 0 };
        }
        aggregatedData[day].bookings += 1;
        aggregatedData[day].revenue += parseFloat(booking.total_amount);
      });
      
      // Convert to array format for Recharts
      const chartData = Object.entries(aggregatedData).map(([name, data]) => ({
        name,
        bookings: data.bookings,
        revenue: data.revenue
      }));
      
      // If no real data, return placeholder data
      if (chartData.length === 0) {
        return [
          { name: "Mon", bookings: 0, revenue: 0 },
          { name: "Tue", bookings: 0, revenue: 0 },
          { name: "Wed", bookings: 0, revenue: 0 },
          { name: "Thu", bookings: 0, revenue: 0 },
          { name: "Fri", bookings: 0, revenue: 0 },
          { name: "Sat", bookings: 0, revenue: 0 },
          { name: "Sun", bookings: 0, revenue: 0 },
        ];
      }
      
      return chartData;
    },
    enabled: !!user,
  });

  // Fetch recent booking activity
  useEffect(() => {
    const fetchRecentBookings = async () => {
      if (!user) return;
      
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          id,
          booking_date,
          total_amount,
          status,
          provider_services!inner(title),
          profiles!inner(name)
        `)
        .eq("provider_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);
      
      if (error) {
        console.error("Error fetching recent bookings:", error);
      } else if (data) {
        setRecentBookings(data.map(booking => ({
          id: booking.id,
          service: booking.provider_services.title,
          user: booking.profiles.name,
          status: booking.status,
          date: booking.booking_date
        })));
      }
    };
    
    fetchRecentBookings();
    
    // Set up real-time listener for bookings
    const bookingsChannel = supabase
      .channel('public:bookings')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'bookings',
        filter: `provider_id=eq.${user?.id}`
      }, () => {
        fetchRecentBookings(); // Refetch when data changes
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(bookingsChannel);
    };
  }, [user]);

  return (
    <ProviderLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Dashboard</h1>
          <DateRangePicker 
            dateRange={dateRange} 
            onDateRangeChange={setDateRange} 
          />
        </div>
        
        <div className="grid gap-6 md:grid-cols-4">
          <Card className="border-brand-100 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Services</CardTitle>
              <div className="h-8 w-8 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-500">
                <List className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats?.servicesCount || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Active service listings
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-brand-100 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bookings</CardTitle>
              <div className="h-8 w-8 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-500">
                <BarChart2 className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats?.bookingsCount || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {dateRange?.from && dateRange?.to ? `${format(dateRange.from, 'MMM d')} - ${format(dateRange.to, 'MMM d, yyyy')}` : 'Selected period'}
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-brand-100 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Earnings</CardTitle>
              <div className="h-8 w-8 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-500">
                <HandCoins className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                ${stats?.totalEarnings.toFixed(2) || "0.00"}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {dateRange?.from && dateRange?.to ? `${format(dateRange.from, 'MMM d')} - ${format(dateRange.to, 'MMM d, yyyy')}` : 'Selected period'}
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-brand-100 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Happy Clients</CardTitle>
              <div className="h-8 w-8 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-500">
                <Users className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {(stats?.bookingsCount || 0) > 10 ? Math.floor((stats?.bookingsCount || 0) * 0.8) : (stats?.bookingsCount || 0)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Satisfied customers
              </p>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="border-brand-100 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-brand-50 to-white dark:from-slate-900 dark:to-slate-950 pb-2 border-b border-brand-100 dark:border-slate-800">
              <CardTitle className="text-gray-900 dark:text-gray-100">Weekly Bookings</CardTitle>
              <CardDescription>
                Number of bookings over the selected period
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fill: '#6b7280' }} />
                  <YAxis tick={{ fill: '#6b7280' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      borderColor: '#e5e7eb',
                      borderRadius: '6px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar dataKey="bookings" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card className="border-brand-100 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-brand-50 to-white dark:from-slate-900 dark:to-slate-950 pb-2 border-b border-brand-100 dark:border-slate-800">
              <CardTitle className="text-gray-900 dark:text-gray-100">Weekly Revenue</CardTitle>
              <CardDescription>
                Revenue generated over the selected period
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyData || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fill: '#6b7280' }} />
                  <YAxis tick={{ fill: '#6b7280' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      borderColor: '#e5e7eb',
                      borderRadius: '6px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#8B5CF6" 
                    strokeWidth={2}
                    dot={{ r: 4, fill: '#8B5CF6' }}
                    activeDot={{ r: 6, fill: '#8B5CF6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
        
        <Card className="border-brand-100 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-brand-50 to-white dark:from-slate-900 dark:to-slate-950 pb-2 border-b border-brand-100 dark:border-slate-800">
            <CardTitle className="text-gray-900 dark:text-gray-100">Recent Booking Activity</CardTitle>
            <CardDescription>
              Your most recent service bookings
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {recentBookings.length > 0 ? (
              <div className="space-y-4">
                {recentBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between border-b border-brand-100 dark:border-slate-800 pb-4 last:border-0">
                    <div className="flex gap-4 items-center">
                      <div className="h-10 w-10 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-500">
                        <Clock className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">{booking.service}</p>
                        <p className="text-sm text-muted-foreground">
                          Booked by {booking.user} · {format(new Date(booking.date), 'PPP')}
                        </p>
                      </div>
                    </div>
                    <div>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium
                        ${booking.status === 'confirmed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 
                          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' : 
                          'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'}`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No recent bookings</h3>
                <p className="text-muted-foreground">
                  When clients book your services, they'll appear here
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ProviderLayout>
  );
}
