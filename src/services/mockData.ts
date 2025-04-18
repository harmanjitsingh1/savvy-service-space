
import { Service, Category, Review } from '@/types';

export const CATEGORIES: Category[] = [
  {
    id: '1',
    name: 'House Cleaning',
    icon: 'home',
    description: 'Professional home cleaning services'
  },
  {
    id: '2',
    name: 'Plumbing',
    icon: 'pipe',
    description: 'Expert plumbing repair and installation'
  },
  {
    id: '3',
    name: 'Electrical',
    icon: 'zap',
    description: 'Electrical repairs and installations'
  },
  {
    id: '4',
    name: 'Carpentry',
    icon: 'hammer',
    description: 'Custom carpentry and woodworking'
  },
  {
    id: '5',
    name: 'Appliance Repair',
    icon: 'tv',
    description: 'Repairs for all household appliances'
  },
  {
    id: '6',
    name: 'Painting',
    icon: 'palette',
    description: 'Interior and exterior painting services'
  },
  {
    id: '7',
    name: 'AC Service',
    icon: 'fan',
    description: 'AC installation, repair and maintenance'
  },
  {
    id: '8',
    name: 'Pet Services',
    icon: 'dog',
    description: 'Pet grooming, sitting, and walking'
  },
  {
    id: '9',
    name: 'Car Wash',
    icon: 'car',
    description: 'Car washing and detailing services'
  },
  {
    id: '10',
    name: 'Car Repair',
    icon: 'wrench',
    description: 'Automotive repair and maintenance'
  }
];

export const SERVICES: Service[] = [
  {
    id: '1',
    title: 'Professional Home Cleaning',
    description: 'Complete home cleaning service including dusting, vacuuming, mopping, kitchen and bathroom cleaning. We use eco-friendly products and guarantee satisfaction.',
    price: 80,
    category: 'House Cleaning',
    providerId: '2',
    providerName: 'Jane Smith',
    providerImage: 'https://images.unsplash.com/photo-1580489944761-15a19d654956',
    images: [
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952',
      'https://images.unsplash.com/photo-1584622781564-1d987f7333c1',
      'https://images.unsplash.com/photo-1563453392212-326f5e854473'
    ],
    rating: 4.8,
    reviewCount: 124,
    location: 'San Francisco, CA',
    duration: 3,
    available: true,
    featured: true,
    createdAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    title: 'Emergency Plumbing Service',
    description: 'Available 24/7 for all your plumbing emergencies. We handle leaks, clogs, installations, and repairs with guaranteed quality work.',
    price: 95,
    category: 'Plumbing',
    providerId: '3',
    providerName: 'Mike Johnson',
    providerImage: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857',
    images: [
      'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39',
      'https://images.unsplash.com/photo-1521207418485-99c705420785',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64'
    ],
    rating: 4.6,
    reviewCount: 89,
    location: 'Chicago, IL',
    duration: 2,
    available: true,
    createdAt: '2024-01-18T14:15:00Z'
  },
  {
    id: '3',
    title: 'Electrical Wiring and Repairs',
    description: 'Licensed electrician offering full electrical services including new installations, rewiring, troubleshooting, and repairs. All work meets building code requirements.',
    price: 110,
    category: 'Electrical',
    providerId: '4',
    providerName: 'Sarah Williams',
    providerImage: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e',
    images: [
      'https://images.unsplash.com/photo-1621905251189-08b45249ff78',
      'https://images.unsplash.com/photo-1555963966-b7ae5404b6ed',
      'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f'
    ],
    rating: 4.9,
    reviewCount: 76,
    location: 'Austin, TX',
    duration: 4,
    available: true,
    createdAt: '2024-01-20T09:45:00Z'
  },
  {
    id: '4',
    title: 'Custom Carpentry and Woodworking',
    description: 'Skilled carpenter providing custom woodworking, furniture building, cabinetry, and home improvements. Quality craftsmanship with attention to detail.',
    price: 85,
    category: 'Carpentry',
    providerId: '5',
    providerName: 'David Lee',
    providerImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
    images: [
      'https://images.unsplash.com/photo-1513467535987-fd81bc7d62f8',
      'https://images.unsplash.com/photo-1622977266039-dbb162254c12',
      'https://images.unsplash.com/photo-1574875188660-f32764ba21a9'
    ],
    rating: 4.7,
    reviewCount: 53,
    location: 'Portland, OR',
    duration: 8,
    available: true,
    featured: true,
    createdAt: '2024-01-25T11:20:00Z'
  },
  {
    id: '5',
    title: 'Appliance Repair Specialist',
    description: 'Fast and reliable repair service for all major household appliances including refrigerators, washers, dryers, dishwashers, and ovens. Parts and labor warranty included.',
    price: 75,
    category: 'Appliance Repair',
    providerId: '6',
    providerName: 'Robert Chen',
    providerImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d',
    images: [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758',
      'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1',
      'https://images.unsplash.com/photo-1585421514738-01798e348b17'
    ],
    rating: 4.5,
    reviewCount: 112,
    location: 'Denver, CO',
    duration: 2,
    available: true,
    createdAt: '2024-01-28T15:10:00Z'
  },
  {
    id: '6',
    title: 'Interior and Exterior Painting',
    description: 'Professional painting services for residential and commercial properties. Includes proper preparation, premium materials, and clean, detailed work with even coverage.',
    price: 65,
    category: 'Painting',
    providerId: '7',
    providerName: 'Maria Garcia',
    providerImage: 'https://images.unsplash.com/photo-1580489944761-15a19d654956',
    images: [
      'https://images.unsplash.com/photo-1562259949-e8e7689d7828',
      'https://images.unsplash.com/photo-1589939705384-5185137a7f0f',
      'https://images.unsplash.com/photo-1558882224-dda166733046'
    ],
    rating: 4.4,
    reviewCount: 87,
    location: 'Miami, FL',
    duration: 6,
    available: true,
    createdAt: '2024-02-01T13:25:00Z'
  },
  {
    id: '7',
    title: 'AC Repair and Installation',
    description: 'Complete air conditioning services including installation, repair, maintenance, and cleaning. We service all major brands and provide energy efficiency recommendations.',
    price: 120,
    category: 'AC Service',
    providerId: '8',
    providerName: 'James Wilson',
    providerImage: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857',
    images: [
      'https://images.unsplash.com/photo-1561998338-13ad7883b20f',
      'https://images.unsplash.com/photo-1631957269300-a5c78287e15c',
      'https://images.unsplash.com/photo-1535992165812-68d1861aa71e'
    ],
    rating: 4.3,
    reviewCount: 64,
    location: 'Phoenix, AZ',
    duration: 3,
    available: true,
    featured: true,
    createdAt: '2024-02-05T10:15:00Z'
  },
  {
    id: '8',
    title: 'Pet Grooming Services',
    description: 'Full-service pet grooming including bath, haircut, nail trimming, ear cleaning, and more. We handle all breeds with gentle care in a stress-free environment.',
    price: 55,
    category: 'Pet Services',
    providerId: '9',
    providerName: 'Emily Davis',
    providerImage: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e',
    images: [
      'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7',
      'https://images.unsplash.com/photo-1591160690555-5debfba289f0',
      'https://images.unsplash.com/photo-1596492784531-6e6eb5ea9993'
    ],
    rating: 4.9,
    reviewCount: 138,
    location: 'Seattle, WA',
    duration: 2,
    available: true,
    createdAt: '2024-02-10T14:30:00Z'
  },
  {
    id: '9',
    title: 'Premium Car Wash & Detailing',
    description: 'Comprehensive car cleaning services from basic wash to full detailing. Includes exterior wash, interior cleaning, waxing, polishing, and premium options for luxury vehicles.',
    price: 45,
    category: 'Car Wash',
    providerId: '10',
    providerName: 'Thomas Brown',
    providerImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
    images: [
      'https://images.unsplash.com/photo-1605043155881-2ea201e31e39',
      'https://images.unsplash.com/photo-1560269507-953fd50c80fc',
      'https://images.unsplash.com/photo-1607860108855-64acf2078ed9'
    ],
    rating: 4.2,
    reviewCount: 95,
    location: 'Los Angeles, CA',
    duration: 1,
    available: true,
    createdAt: '2024-02-15T11:45:00Z'
  },
  {
    id: '10',
    title: 'Auto Repair & Maintenance',
    description: 'Full-service auto repair shop offering routine maintenance, diagnostics, brake service, engine repair, transmission work, and more. ASE certified mechanics with fair pricing.',
    price: 90,
    category: 'Car Repair',
    providerId: '11',
    providerName: 'Kevin Martinez',
    providerImage: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857',
    images: [
      'https://images.unsplash.com/photo-1630071655915-c9217145aefc',
      'https://images.unsplash.com/photo-1562747289-9a57e29f0d00',
      'https://images.unsplash.com/photo-1630071652182-c1d7bec60a0c'
    ],
    rating: 4.6,
    reviewCount: 72,
    location: 'Atlanta, GA',
    duration: 4,
    available: true,
    createdAt: '2024-02-20T13:10:00Z'
  }
];

export const REVIEWS: Review[] = [
  {
    id: '1',
    userId: '101',
    userName: 'Alex Thompson',
    userImage: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12',
    serviceId: '1',
    rating: 5,
    comment: 'Absolutely amazing cleaning service! My home has never looked better. The attention to detail was impressive and they were very professional.',
    createdAt: '2024-03-10T14:25:00Z'
  },
  {
    id: '2',
    userId: '102',
    userName: 'Samantha Lee',
    userImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2',
    serviceId: '1',
    rating: 4,
    comment: 'Great service overall. They did miss a few spots under the furniture, but when I pointed it out they immediately fixed it. Would use again.',
    createdAt: '2024-03-05T10:15:00Z'
  },
  {
    id: '3',
    userId: '103',
    userName: 'Michael Johnson',
    userImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
    serviceId: '1',
    rating: 5,
    comment: 'Punctual, thorough, and professional. Used their service twice now and will be booking again next month. Highly recommended!',
    createdAt: '2024-02-28T16:40:00Z'
  },
  {
    id: '4',
    userId: '104',
    userName: 'Jennifer Wilson',
    userImage: 'https://images.unsplash.com/photo-1554151228-14d9def656e4',
    serviceId: '2',
    rating: 5,
    comment: 'Responded quickly to my emergency call, fixed the leaking pipe, and charged a fair price. Couldn\'t ask for more!',
    createdAt: '2024-03-12T09:30:00Z'
  },
  {
    id: '5',
    userId: '105',
    userName: 'Daniel Martinez',
    userImage: 'https://images.unsplash.com/photo-1552058544-f2b08422138a',
    serviceId: '2',
    rating: 4,
    comment: 'Good service and reasonable rates. Fixed my clogged drain quickly. Only giving 4 stars because they were a bit late.',
    createdAt: '2024-03-08T11:20:00Z'
  }
];

export const getServiceById = (id: string): Service | undefined => {
  return SERVICES.find(service => service.id === id);
};

export const getServicesByCategory = (category: string): Service[] => {
  return SERVICES.filter(service => service.category === category);
};

export const getServicesByProvider = (providerId: string): Service[] => {
  return SERVICES.filter(service => service.providerId === providerId);
};

export const getFeaturedServices = (): Service[] => {
  return SERVICES.filter(service => service.featured === true);
};

export const getReviewsForService = (serviceId: string): Review[] => {
  return REVIEWS.filter(review => review.serviceId === serviceId);
};

export const filterServices = ({
  category,
  minPrice,
  maxPrice,
  minRating,
  searchTerm,
  location
}: {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  searchTerm?: string;
  location?: string;
}): Service[] => {
  return SERVICES.filter(service => {
    if (category && service.category !== category) return false;
    if (minPrice !== undefined && service.price < minPrice) return false;
    if (maxPrice !== undefined && service.price > maxPrice) return false;
    if (minRating !== undefined && service.rating < minRating) return false;
    if (searchTerm && !service.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
        !service.description.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    if (location && !service.location.toLowerCase().includes(location.toLowerCase())) return false;
    return true;
  });
};
