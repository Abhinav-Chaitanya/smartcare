import add_icon from './add_icon.svg'
import admin_logo from './admin_logo.svg'
import appointment_icon from './appointment_icon.svg'
import cancel_icon from './cancel_icon.svg'
import doctor_icon from './doctor_icon.svg'
import home_icon from './home_icon.svg'
import people_icon from './people_icon.svg'
import upload_area from './upload_area.svg'
import list_icon from './list_icon.svg'
import tick_icon from './tick_icon.svg'
import appointments_icon from './appointments_icon.svg'
import earning_icon from './earning_icon.svg'
import patients_icon from './patients_icon.svg'
import logo from './logo.svg'
import profile_pic from './profile_pic.png'
import dropdown_icon from './dropdown_icon.svg'
import group_profiles from './group_profiles.png'
import arrow_icon from './arrow_icon.svg'
import header_img from './header_img.png'
import Dermatologist from './Dermatologist.svg'
import Gastroenterologist from './Gastroenterologist.svg'
import General_physician from './General_physician.svg'
import Gynecologist from './Gynecologist.svg'
import Neurologist from './Neurologist.svg'
import Pediatricians from './Pediatricians.svg'
import doc1 from './doc1.png'
import doc2 from './doc2.png'
import doc3 from './doc3.png'
import doc4 from './doc4.png'
import doc5 from './doc5.png'
import doc6 from './doc6.png'
import doc7 from './doc7.png'
import doc8 from './doc8.png'
import doc9 from './doc9.png'
import doc10 from './doc10.png'
import doc11 from './doc11.png'
import doc12 from './doc12.png'
import doc13 from './doc13.png'
import doc14 from './doc14.png'
import doc15 from './doc15.png'
import appointment_img from './appointment_img.png'
import about_image from './about_image.png'
import logo1 from './logo1.png'
import header_img1 from './header_img1.png'
import header_img2 from './header_img2.png'
import header_img3 from './header_img3.png'
import header_img4 from './header_img4.png'
import verified_icon from './verified_icon.svg'
import info_icon from './info_icon.svg'
import contact_image from './contact_image.png'
import menu_icon from './menu_icon.svg'
import cross_icon from './cross_icon.png'
import profile_pic1 from './profile_pic1.png'
import doc1_new from './doc1_new.png'
import doc2_new from './doc2_new.png'
import doc3_new from './doc3_new.png'
import doc4_new from './doc4_new.png'
import doc5_new from './doc5_new.png'
import doc6_new from './doc6_new.png'
import doc7_new from './doc7_new.png'
import doc8_new from './doc8_new.png'
import doc9_new from './doc9_new.png'
import doc10_new from './doc10_new.png'
import doc11_new from './doc11_new.png'
import doc12_new from './doc12_new.png'
import doc13_new from './doc13_new.png'
import doc14_new from './doc14_new.png'
import doc15_new from './doc15_new.png'


export const assets = {
    add_icon,
    admin_logo,
    appointment_icon,
    cancel_icon,
    doctor_icon,
    upload_area,
    home_icon,
    patients_icon,
    people_icon,
    list_icon,
    tick_icon,
    appointments_icon,
    earning_icon,
    logo,
    profile_pic,
    dropdown_icon,
    group_profiles,
    arrow_icon,
    header_img,
    appointment_img,
    about_image,
    logo1,
    header_img1,
    header_img2,
    header_img3,
    header_img4,
    verified_icon,
    info_icon,
    contact_image,
    menu_icon,
    cross_icon,
    profile_pic1,
    doc1_new,
    doc2_new,
    doc3_new,
    doc4_new,
    doc5_new,
    doc6_new,
    doc7_new,
    doc8_new,
    doc9_new,
    doc10_new,
    doc11_new,
    doc12_new,
    doc13_new,
    doc14_new,
    doc15_new
}

export const specialityData = [
    {
        speciality: 'General physician',
        image: General_physician
    },
    {
        speciality: 'Gynecologist',
        image: Gynecologist
    },
    {
        speciality: 'Dermatologist',
        image: Dermatologist
    },
    {
        speciality: 'Pediatricians',
        image: Pediatricians
    },
    {
        speciality: 'Neurologist',
        image: Neurologist
    },
    {
        speciality: 'Gastroenterologist',
        image: Gastroenterologist
    },
]


/*export const doctors = [
  {
    _id: 'doc1',
    name: 'Dr. Richardson',
    image: doc1,
    speciality: 'General physician',
    degree: 'MBBS',
    experience: '4 Years',
    about: 'Dr. Richard has a strong commitment to delivering comprehensive medical care focusing on preventive medicine, early diagnosis, and effective treatment strategies. Dr. Richard has a strong commitment to delivering comprehensive medical care focusing on preventive medicine, early diagnosis, and effective treatment strategies. ',
    fees: 500,
    address: {
      line1: '18th Cross, Richmond',
      line2: 'Circle, Ring Road, London'
    }
  },
  {
    _id: 'doc2',
    name: 'Dr. Olivia Carter',
    image: doc2,
    speciality: 'Gynecologist',
    degree: 'MBBS, MD',
    experience: '6 Years',
    about: 'Dr. Olivia is a compassionate gynecologist with expertise in women’s reproductive health and prenatal care.',
    fees: 600,
    address: {
      line1: '12 Park Street',
      line2: 'Downtown Avenue, London'
    }
  },
  {
    _id: 'doc3',
    name: 'Dr. Henry Adams',
    image: doc3,
    speciality: 'Dermatologist',
    degree: 'MBBS, DDVL',
    experience: '8 Years',
    about: 'Dr. Henry specializes in treating various skin conditions and promoting healthy skincare routines.',
    fees: 700,
    address: {
      line1: '45 Elm Road',
      line2: 'Baker Street, London'
    }
  },
  {
    _id: 'doc4',
    name: 'Dr. Daniel Brown',
    image: doc4,
    speciality: 'Pediatricians',
    degree: 'MBBS, DCH',
    experience: '5 Years',
    about: 'Dr. Daniel provides excellent care for children, ensuring their physical and emotional well-being.',
    fees: 550,
    address: {
      line1: '10 Maple Lane',
      line2: 'Kensington, London'
    }
  },
  {
    _id: 'doc5',
    name: 'Dr. Sophia Green',
    image: doc5,
    speciality: 'Neurologist',
    degree: 'MBBS, DM (Neuro)',
    experience: '9 Years',
    about: 'Dr. Sophia is a neurologist dedicated to diagnosing and managing complex brain and nervous system disorders.',
    fees: 900,
    address: {
      line1: '22 Rosewood Street',
      line2: 'West End, London'
    }
  },
  {
    _id: 'doc6',
    name: 'Dr. Michael Harris',
    image: doc6,
    speciality: 'General physician',
    degree: 'MBBS',
    experience: '3 Years',
    about: 'Dr. Michael focuses on preventive medicine and holistic health care for all age groups.',
    fees: 400,
    address: {
      line1: '77 Pine Avenue',
      line2: 'Soho, London'
    }
  },
  {
    _id: 'doc7',
    name: 'Dr. Benjamin Scott',
    image: doc7,
    speciality: 'Gastroenterologist',
    degree: 'MBBS, DM (Gastro)',
    experience: '7 Years',
    about: 'Dr. Benjamin specializes in digestive system disorders and advanced endoscopic procedures.',
    fees: 800,
    address: {
      line1: '31 Oxford Street',
      line2: 'Central City, London'
    }
  },
  {
    _id: 'doc8',
    name: 'Dr. William Johnson',
    image: doc8,
    speciality: 'Dermatologist',
    degree: 'MBBS, MD (Dermatology)',
    experience: '10 Years',
    about: 'Dr. William is known for his expertise in cosmetic dermatology and skin rejuvenation treatments.',
    fees: 750,
    address: {
      line1: '19 Highbury Road',
      line2: 'Notting Hill, London'
    }
  },
  {
    _id: 'doc9',
    name: 'Dr. Emily Turner',
    image: doc9,
    speciality: 'Pediatricians',
    degree: 'MBBS, DCH',
    experience: '6 Years',
    about: 'Dr. Emily offers dedicated care for infants and children, focusing on healthy development and growth.',
    fees: 600,
    address: {
      line1: '5 Willow Avenue',
      line2: 'Stratford, London'
    }
  },
  {
    _id: 'doc10',
    name: 'Dr. Thomas White',
    image: doc10,
    speciality: 'Gynecologist',
    degree: 'MBBS, MS',
    experience: '11 Years',
    about: 'Dr. Thomas has extensive experience in gynecological surgeries and reproductive health management.',
    fees: 850,
    address: {
      line1: '39 Crescent Road',
      line2: 'Camden, London'
    }
  },
  {
    _id: 'doc11',
    name: 'Dr. Grace Hill',
    image: doc11,
    speciality: 'General physician',
    degree: 'MBBS',
    experience: '4 Years',
    about: 'Dr. Grace is dedicated to preventive care and holistic wellness for her patients.',
    fees: 500,
    address: {
      line1: '8 Station Road',
      line2: 'Paddington, London'
    }
  },
  {
    _id: 'doc12',
    name: 'Dr. Christopher Evans',
    image: doc12,
    speciality: 'Gastroenterologist',
    degree: 'MBBS, MD (Gastro)',
    experience: '8 Years',
    about: 'Dr. Evans focuses on accurate diagnosis and treatment of gastrointestinal and liver conditions.',
    fees: 700,
    address: {
      line1: '28 Lincoln Street',
      line2: 'Chelsea, London'
    }
  },
  {
    _id: 'doc13',
    name: 'Dr. Isabella Lewis',
    image: doc13,
    speciality: 'Neurologist',
    degree: 'MBBS, DM (Neuro)',
    experience: '5 Years',
    about: 'Dr. Isabella specializes in migraine, epilepsy, and neurodegenerative disorders with a patient-centered approach.',
    fees: 950,
    address: {
      line1: '42 Brook Lane',
      line2: 'Victoria, London'
    }
  },
  {
    _id: 'doc14',
    name: 'Dr. Andrew Walker',
    image: doc14,
    speciality: 'Dermatologist',
    degree: 'MBBS, DDVL',
    experience: '9 Years',
    about: 'Dr. Andrew has deep expertise in skin surgery, acne treatments, and cosmetic dermatology.',
    fees: 800,
    address: {
      line1: '14 Greenfield Road',
      line2: 'East End, London'
    }
  },
  {
    _id: 'doc15',
    name: 'Dr. Charlotte Baker',
    image: doc15,
    speciality: 'Gynecologist',
    degree: 'MBBS, MD (OBG)',
    experience: '7 Years',
    about: 'Dr. Charlotte is a caring gynecologist who emphasizes women’s wellness and safe maternity practices.',
    fees: 700,
    address: {
      line1: '25 Garden Street',
      line2: 'Liverpool, London'
    }
  }
]*/

export const doctors = [
  {
    _id: 'doc1',
    name: 'Dr. Karthikeya',
    image: doc1_new,
    speciality: 'General physician',
    degree: 'MBBS',
    experience: '4 Years',
    about: 'Dr. Karthik is a trusted general physician in Nellore, focused on preventive care and practical treatment plans.',
    fees: 500,
    address: {
      line1: 'Dargamitta Road',
      line2: 'Nellore, Andhra Pradesh'
    }
  },
  {
    _id: 'doc2',
    name: 'Dr. Sridevi',
    image: doc2_new,
    speciality: 'Gynecologist',
    degree: 'MBBS, MD',
    experience: '6 Years',
    about: 'Dr. Sridevi specialises in women’s health and prenatal care with a compassionate approach.',
    fees: 600,
    address: {
      line1: 'Kothapeta Main Road',
      line2: 'Nellore, Andhra Pradesh'
    }
  },
  {
    _id: 'doc3',
    name: 'Dr. Praveen Kumar',
    image: doc3_new,
    speciality: 'Dermatologist',
    degree: 'MBBS, DDVL',
    experience: '8 Years',
    about: 'Dr. Praveen treats a wide range of skin conditions and advises patients on long-term skin health.',
    fees: 700,
    address: {
      line1: 'DPS Road (Near Bus Stand)',
      line2: 'Nellore, Andhra Pradesh'
    }
  },
  {
    _id: 'doc4',
    name: 'Dr. Hema Latha',
    image: doc4_new,
    speciality: 'Pediatricians',
    degree: 'MBBS, DCH',
    experience: '5 Years',
    about: 'Dr. Hema provides gentle, evidence-based care for infants and children across Nellore.',
    fees: 550,
    address: {
      line1: 'Allipuram Street',
      line2: 'Nellore, Andhra Pradesh'
    }
  },
  {
    _id: 'doc5',
    name: 'Dr. Srinivasa Rao',
    image: doc5_new,
    speciality: 'Neurologist',
    degree: 'MBBS, DM (Neuro)',
    experience: '9 Years',
    about: 'Dr. Srinivasa focuses on diagnosing and managing neurologic conditions with patient-centered care.',
    fees: 900,
    address: {
      line1: 'Venkatagiri Road',
      line2: 'Nellore, Andhra Pradesh'
    }
  },
  {
    _id: 'doc6',
    name: 'Dr. Sudhakar Reddy',
    image: doc6_new,
    speciality: 'General physician',
    degree: 'MBBS',
    experience: '3 Years',
    about: 'Dr. Sudhakar offers practical primary care and lifestyle advice tailored to each patient.',
    fees: 400,
    address: {
      line1: 'Bharat Nagar',
      line2: 'Nellore, Andhra Pradesh'
    }
  },
  {
    _id: 'doc7',
    name: 'Dr. Naga Venkata',
    image: doc7_new,
    speciality: 'Gastroenterologist',
    degree: 'MBBS, DM (Gastro)',
    experience: '7 Years',
    about: 'Dr. Naga specialises in digestive health and advanced endoscopic procedures in Nellore.',
    fees: 800,
    address: {
      line1: 'Krishna Canal Road',
      line2: 'Nellore, Andhra Pradesh'
    }
  },
  {
    _id: 'doc8',
    name: 'Dr. Geetha Devi',
    image: doc8_new,
    speciality: 'Dermatologist',
    degree: 'MBBS, MD (Dermatology)',
    experience: '10 Years',
    about: 'Dr. Geetha is experienced in cosmetic and medical dermatology with a strong local practice.',
    fees: 750,
    address: {
      line1: 'KRR Road',
      line2: 'Nellore, Andhra Pradesh'
    }
  },
  {
    _id: 'doc9',
    name: 'Dr. Rajasekhar',
    image: doc9_new,
    speciality: 'Pediatricians',
    degree: 'MBBS, DCH',
    experience: '6 Years',
    about: 'Dr. Rajasekhar focuses on healthy growth and development, offering clear guidance to parents.',
    fees: 600,
    address: {
      line1: 'Ram Nagar',
      line2: 'Nellore, Andhra Pradesh'
    }
  },
  {
    _id: 'doc10',
    name: 'Dr. Padmaja',
    image: doc10_new,
    speciality: 'Gynecologist',
    degree: 'MBBS, MS',
    experience: '11 Years',
    about: 'Dr. Padmaja has wide experience in gynecological care and surgical procedures with gentle bedside manner.',
    fees: 850,
    address: {
      line1: 'Sullurpet Road',
      line2: 'Nellore, Andhra Pradesh'
    }
  },
  {
    _id: 'doc11',
    name: 'Dr. Venkatesh',
    image: doc11_new,
    speciality: 'General physician',
    degree: 'MBBS',
    experience: '4 Years',
    about: 'Dr. Venkatesh emphasises preventive care and practical treatment plans for families in Nellore.',
    fees: 500,
    address: {
      line1: 'Car Street',
      line2: 'Nellore, Andhra Pradesh'
    }
  },
  {
    _id: 'doc12',
    name: 'Dr. Srikanth',
    image: doc12_new,
    speciality: 'Gastroenterologist',
    degree: 'MBBS, MD (Gastro)',
    experience: '8 Years',
    about: 'Dr. Srikanth provides careful diagnosis and treatment for gastrointestinal and liver conditions.',
    fees: 700,
    address: {
      line1: 'White Town Road',
      line2: 'Nellore, Andhra Pradesh'
    }
  },
  {
    _id: 'doc13',
    name: 'Dr. Narayana',
    image: doc13_new,
    speciality: 'Neurologist',
    degree: 'MBBS, DM (Neuro)',
    experience: '5 Years',
    about: 'Dr. Narayana treats headaches, epilepsy and neurodegenerative disorders with empathy and skill.',
    fees: 950,
    address: {
      line1: 'Kothapeta Junction',
      line2: 'Nellore, Andhra Pradesh'
    }
  },
  {
    _id: 'doc14',
    name: 'Dr. Chandra Sekhar',
    image: doc14_new,
    speciality: 'Dermatologist',
    degree: 'MBBS, DDVL',
    experience: '9 Years',
    about: 'Dr. Chandra is experienced in acne, skin surgery, and cosmetic dermatology for local patients.',
    fees: 800,
    address: {
      line1: 'Station Road',
      line2: 'Nellore, Andhra Pradesh'
    }
  },
  {
    _id: 'doc15',
    name: 'Dr. Lakshmi Devi',
    image: doc15_new,
    speciality: 'Gynecologist',
    degree: 'MBBS, MD (OBG)',
    experience: '7 Years',
    about: 'Dr. Lakshmi focuses on women’s wellness and safe maternity care in Nellore.',
    fees: 700,
    address: {
      line1: 'Market Road',
      line2: 'Nellore, Andhra Pradesh'
    }
  }
];

