export interface Church {
  id: string;
  name: string;
  denomination: string;
  founded: number;
  address: string;
  city: string;
  state: string;
  country: string;
  lat: number;
  lng: number;
  description: string;
  history: string;
  architecturalStyle: string;
  images: string[];
  structuralRating?: number;
  expertComments?: ExpertComment[];
  posts: Post[];
}

export interface ExpertComment {
  id: string;
  expertId: string;
  expertName: string;
  rating: number;
  comment: string;
  recommendations: string;
  date: string;
  verified: boolean;
}

export interface Post {
  id: string;
  userId: string;
  userName: string;
  content: string;
  date: string;
  images?: string[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'expert' | 'admin';
  verified: boolean;
  expertise?: string;
}

export const mockChurches: Church[] = [
  {
    id: "1",
    name: "St. Patrick's Cathedral",
    denomination: "Catholic",
    founded: 1858,
    address: "5th Avenue",
    city: "New York",
    state: "NY",
    country: "USA",
    lat: 40.7585,
    lng: -73.9760,
    description: "A decorated Neo-Gothic-style Roman Catholic cathedral church in the United States",
    history: "St. Patrick's Cathedral is the seat of the archbishop of the Roman Catholic Archdiocese of New York. Construction began in 1858 and was completed in 1878. The cathedral is regarded as one of the most significant Gothic Revival buildings in the United States.",
    architecturalStyle: "Gothic Revival",
    images: ["https://images.unsplash.com/photo-1548625149-fc4a29cf7092?w=800"],
    structuralRating: 9,
    expertComments: [
      {
        id: "ec1",
        expertId: "e1",
        expertName: "Dr. James Mitchell",
        rating: 9,
        comment: "Excellent structural integrity with well-maintained Gothic arches and buttresses.",
        recommendations: "Minor repairs needed on the northwest spire. Regular maintenance of stone work recommended.",
        date: "2026-02-15",
        verified: true,
      }
    ],
    posts: [
      {
        id: "p1",
        userId: "u1",
        userName: "Sarah Johnson",
        content: "Attended a beautiful wedding ceremony here last week. The stained glass windows are breathtaking!",
        date: "2026-03-20",
      }
    ]
  },
  {
    id: "2",
    name: "Westminster Abbey",
    denomination: "Anglican",
    founded: 960,
    address: "20 Deans Yard",
    city: "London",
    state: "",
    country: "UK",
    lat: 51.4993,
    lng: -0.1273,
    description: "A large, mainly Gothic abbey church in the City of Westminster, London",
    history: "Westminster Abbey has been the coronation church since 1066 and is the final resting place of 17 monarchs. The present church, begun by Henry III in 1245, is one of the most important Gothic buildings in the country.",
    architecturalStyle: "Gothic",
    images: ["https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800"],
    structuralRating: 8,
    expertComments: [
      {
        id: "ec2",
        expertId: "e2",
        expertName: "Prof. Elizabeth Harper",
        rating: 8,
        comment: "Historic structure in good condition considering age. Foundation requires monitoring.",
        recommendations: "Continued monitoring of foundation settlement. Climate control improvements for preservation.",
        date: "2026-01-10",
        verified: true,
      }
    ],
    posts: []
  },
  {
    id: "3",
    name: "Notre-Dame de Paris",
    denomination: "Catholic",
    founded: 1163,
    address: "6 Parvis Notre-Dame",
    city: "Paris",
    state: "",
    country: "France",
    lat: 48.8530,
    lng: 2.3499,
    description: "Medieval Catholic cathedral on the Île de la Cité",
    history: "Notre-Dame de Paris is one of the finest examples of French Gothic architecture. Construction began in 1163 under Bishop Maurice de Sully and was largely completed by 1260. After the 2019 fire, extensive restoration efforts are underway.",
    architecturalStyle: "French Gothic",
    images: ["https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800"],
    structuralRating: 6,
    expertComments: [
      {
        id: "ec3",
        expertId: "e1",
        expertName: "Dr. James Mitchell",
        rating: 6,
        comment: "Post-fire restoration in progress. Structural stability restored but extensive work remains.",
        recommendations: "Continue restoration according to preservation guidelines. Install modern fire suppression systems.",
        date: "2026-03-05",
        verified: true,
      }
    ],
    posts: [
      {
        id: "p2",
        userId: "u2",
        userName: "Pierre Dubois",
        content: "The restoration work is impressive. Can't wait to see it fully restored to its former glory.",
        date: "2026-03-25",
      }
    ]
  },
  {
    id: "4",
    name: "Sagrada Família",
    denomination: "Catholic",
    founded: 1882,
    address: "Carrer de Mallorca, 401",
    city: "Barcelona",
    state: "",
    country: "Spain",
    lat: 41.4036,
    lng: 2.1744,
    description: "Large unfinished Roman Catholic minor basilica designed by Antoni Gaudí",
    history: "Construction of the Sagrada Família began in 1882 under architect Francisco de Paula del Villar. In 1883, Antoni Gaudí took over and transformed the project with his unique architectural and engineering style. The basilica is expected to be completed in 2026.",
    architecturalStyle: "Modernist",
    images: ["https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800"],
    structuralRating: 10,
    expertComments: [
      {
        id: "ec4",
        expertId: "e3",
        expertName: "Dr. Carlos Rodriguez",
        rating: 10,
        comment: "Revolutionary structural design with exceptional engineering. Modern construction techniques ensure longevity.",
        recommendations: "Continue construction with same high standards. Excellent drainage and load-bearing systems in place.",
        date: "2026-02-28",
        verified: true,
      }
    ],
    posts: [
      {
        id: "p3",
        userId: "u3",
        userName: "Maria Garcia",
        content: "Gaudí's masterpiece! The combination of nature-inspired designs and structural innovation is unmatched.",
        date: "2026-03-15",
      }
    ]
  },
  {
    id: "5",
    name: "Trinity Church",
    denomination: "Episcopal",
    founded: 1697,
    address: "75 Broadway",
    city: "New York",
    state: "NY",
    country: "USA",
    lat: 40.7081,
    lng: -74.0125,
    description: "Historic Episcopal church at the intersection of Wall Street and Broadway",
    history: "Trinity Church has been a pivotal part of New York City's history. The current building, consecrated in 1846, is the third church on the site. Its Gothic Revival architecture and prominent spire made it the tallest building in New York City until 1890.",
    architecturalStyle: "Gothic Revival",
    images: ["https://images.unsplash.com/photo-1519503584934-6de32ff3b26d?w=800"],
    structuralRating: 8,
    expertComments: [],
    posts: []
  }
];

export const currentUser: User | null = null;

export const mockUsers: User[] = [
  {
    id: "u1",
    name: "Sarah Johnson",
    email: "sarah@example.com",
    role: "user",
    verified: false,
  },
  {
    id: "e1",
    name: "Dr. James Mitchell",
    email: "james@example.com",
    role: "expert",
    verified: true,
    expertise: "Structural Engineering",
  },
  {
    id: "e2",
    name: "Prof. Elizabeth Harper",
    email: "elizabeth@example.com",
    role: "expert",
    verified: true,
    expertise: "Historic Preservation",
  },
  {
    id: "admin1",
    name: "Admin User",
    email: "admin@example.com",
    role: "admin",
    verified: true,
  }
];
