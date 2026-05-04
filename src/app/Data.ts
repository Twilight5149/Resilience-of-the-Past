export interface Church {
  id: string;
  name: string;
  founded: number;
  address: string;
  city: string;
  province: string;
  country: string;
  lat: number;
  lng: number;
  description: string;
  history: string;
  architecturalStyle: string;
  images: string[];
  feast: string;
  diocese: string;
  unrated?: boolean;
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
    name: "Our Lady of Light Parish",

    founded: 1753,
    address: "Moto Sur",
    city: "Loon",
    province: "Bohol",
    country: "Philippines",
    lat: 9.7989,
    lng:123.7925,
    description: "The Our Lady of Light Parish Church (Nuestra Señora de la Luz) in Loon, Bohol, is the largest heritage church in the province and is considered the \"crowning glory\" of Augustinian Recollect architecture in the Philippines.",
    history: "The parish was established by the Jesuits in 1753. The stone church was later built between 1855 and 1864 under the direction of Father Jose Garcia and architect Domingo de Escondrillas. The church and its adjacent convent were completely reduced to rubble by a 7.2 magnitude earthquake on October 15, 2013. The original wooden image of the patroness, the Birhen sa Kasilak, was miraculously retrieved from the ruins largely unscathed. Reconstruction: An eight-year restoration project (2013–2021) led by the National Museum of the Philippines utilized original coral stones for cladding while reinforcing the core with concrete and steel to make it earthquake-proof. ",
    architecturalStyle: "Baroque and Neoclassical",
    images: ["https://cdn.nimbu.io/s/vyfx0d4/channelentries/3lqa99x/files/IMG_9069.JPG"],
    feast: "September 8",
    diocese:"Tagbilaran",
    structuralRating: 10,
    unrated: true,
    expertComments: [
    ],
    posts: [
    ]
  },
  {
    id: "2",
    name: "San Vicente Ferrer Parish",
    founded: 1933,
    address: "Poblacion",
    city: "Calape",
    province: "Bohol",
    country: "Philippines",
    lat: 9.8914,
    lng: 123.8725,
    description: "The Saint Vincent Ferrer Parish Church, commonly known as Calape Church, is a Roman Catholic church in Calape, Bohol, Philippines. It was formally declared a National Cultural Treasure by the National Museum of the Philippines on May 9, 2023, making it the ninth church in Bohol to receive this prestigious title. ",
    history: "It sustained significant damage but remained standing unlike its counterparts in Maribojoc and Loon. Restoration was completed in 2019, and it was declared a National Cultural Treasure in 2023.",
    architecturalStyle: "Neo-Gothic",
    images: ["https://upload.wikimedia.org/wikipedia/commons/thumb/7/7f/Saint_Vincent_Ferrer_Church_Calape_%28Tagbilaran_North_Road%2C_Calape%2C_Bohol%3B_01-13-2023%29.jpg/1280px-Saint_Vincent_Ferrer_Church_Calape_%28Tagbilaran_North_Road%2C_Calape%2C_Bohol%3B_01-13-2023%29.jpg"],
    feast: "May 10 (Coinciding with the Pahinungod Festival).",
    diocese:"Tagbilaran",
    structuralRating: 8,
    unrated: false,
    expertComments: [
    ],
    posts: []
  },
  {
    id: "3",
    name: "Assumption of Our Lady Shrine-Parish",
    founded: 1697,
    address: "Poblacion",
    city: "Dauis",
    province: "Bohol",
    country: "Philippines",
    lat: 9.6247,
    lng: 123.8647,
    description: "The Assumption of Our Lady Shrine Parish, popularly known as Dauis Church, is an 18th-century Roman Catholic church in Dauis on Panglao Island, Bohol. Founded by Jesuit priests in 1697, it is recognized as a National Historical Landmark and a National Cultural Treasure.",
    history: "The church sustained severe damage, particularly to its front façade and portico, which partially crumbled. The stone walls also suffered cracks and dislodgement. The National Historical Commission of the Philippines (NHCP) led a four-year restoration project, and the church was officially reopened and turned over to the diocese on August 14, 2017.",
    architecturalStyle: "Neo-Gothic and Neo-Classical",
    images: ["https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Dauis_church_Bohol.jpg/1280px-Dauis_church_Bohol.jpg"],
    feast: "August 15 (Feast of the Assumption of Mary).",
    diocese:"Tagbilaran",
    structuralRating: 6,
    unrated: true,
    expertComments: [
    ],
    posts: [
    ]
  },
  {
    id: "4",
    name: "St. Joseph the Worker Cathedral Shrine-Parish",
    founded: 1767,
    address: "Cogon",
    city: "Tagbilaran City",
    province: "Bohol",
    country: "Philippines",
    lat: 9.6414,
    lng: 123.8547,
    description: "St. Joseph the Worker Cathedral Shrine-Parish (officially the Diocesan Shrine and Cathedral-Parish of St. Joseph the Worker) is the primary Roman Catholic church in Tagbilaran City, Bohol. It serves as the seat of the Diocese of Tagbilaran, which covers the western half of the province. ",
    history: "The cathedral sustained significant damage to its exterior and interior, including cracks in the walls and damage to its ceiling paintings. Unlike some rural churches, it did not collapse, partly due to past architectural interventions using reinforced concrete. It has since undergone major reconstructions and remains the active seat of the Diocese of Tagbilaran. ",
    architecturalStyle: "Neo-Romanesque",
    images: ["https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/Saint_Joseph_Cathedral_Tagbilaran_%28JA_Clarin%2C_Tagbilaran%2C_Bohol%3B_01-09-2023%29.jpg/1280px-Saint_Joseph_Cathedral_Tagbilaran_%28JA_Clarin%2C_Tagbilaran%2C_Bohol%3B_01-09-2023%29.jpg"],
    feast: "May 1 (Feast of St. Joseph the Worker).",
    diocese:"Tagbilaran",
    structuralRating: 10,
    unrated: true,
    expertComments: [
    ],
    posts: [
    ]
  },
  {
    id: "5",
    name: "La Purisima Concepcion de la Virgen Maria Parish Church",
    founded: 1596,
    address: "Poblacion",
    city: "Baclayon",
    province: "Bohol",
    country: "Philippinmes",
    lat: 9.6225,
    lng: 123.9119,
    description: "La Purísima Concepción de la Virgen María Parish Church, widely known as Baclayon Church, is one of the oldest and most significant stone churches in the Philippines. Located in the municipality of Baclayon, Bohol, it was founded by Jesuit missionaries Fr. Juan de Torres and Fr. Gabriel Sánchez in 1596, making it the oldest Christian settlement in the province.",
    history: "The church suffered massive damage; the entire front façade and the upper portions of the bell tower collapsed. The stone walls of the nave and the transept also sustained heavy cracks. Following a meticulous four-year restoration by the National Historical Commission of the Philippines (NHCP), which involved piecing together original coral stones, the church was fully restored and turned over to the diocese on February 27, 2018.",
    architecturalStyle: "Spanish Colonial / Neoclassical",
    images: ["https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEj6FJnMRxx1YmY417m89fdrM0WvZltj70x4JoHsl2iTRpiWZWLwbojhhIlBlp0S6O5atvT7JMRS9Yatk4mqaY5wttl7P7AfzsraYMsJgEW8wxHLflr3SKckrfCdnr-ifCUWwnOROnzkyELj/s1600/1.jpg"],
    feast: "December 8 (Feast of the Immaculate Conception).",
    diocese:"Tagbilaran",
    structuralRating: 8,
    unrated: true,
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
