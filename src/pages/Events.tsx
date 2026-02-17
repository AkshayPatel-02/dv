import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, Filter } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface Event {
  title: string;
  date: string;
  time: string;
  location: string;
  attendees: string;
  description: string;
  image: string;
  link?: string;
  registrationLink: string;
  gallerySlug?: string;
}

const Events = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(
    (location.state as any)?.tab === 'past' ? 'past' : 'upcoming'
  );

  // 📌 UPCOMING EVENTS - Frame2Reality with STANDARD styling
  const upcomingEvents: Event[] = [
    {
      title: 'FRAME2REALITY',
      date: 'FEB 20-21, 2026',
      time: '10:00 AM - 4:20 PM',
      location: 'Nalanda Auditorium, VBIT',
      attendees: 'Registration Open',
      description: 'Master Unity 3D and build AR Applications in this intensive 2-Day bootcamp. From wireframes to deployed apps - Level up from Player to Developer.',
      image: '/Frame2Reality.png',
      link: '/frame2reality',
      registrationLink: '/frame2reality',
    }
  ];

  // 📌 PAST EVENTS
  const pastEvents: Event[] = [
    {
      title: 'ContribX',
      date: 'October 24-25, 2025',
      time: '10:00 AM - 4:20 PM',
      location: 'Nalanda Auditorium , VBIT',
      attendees: '250+',
      description: 'ContribX is a hands-on workshop focusing on Git, GitHub, and Open Source contributions.The two-day event included hands-on training for version control, collaborative development, and a "Fixathon" for debugging real-world projects.',
      registrationLink: 'https://bit.ly/ContribX-registrationform',
      image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&h=400&fit=crop',
      gallerySlug: 'contribx'
    },
    {
      title: 'DATA.LINK',
      date: 'March 15, 2024',
      time: '9:00 AM - 5:00 PM',
      location: 'Nalanda Auditorium, VBIT',
      attendees: '200+',
      description: 'DATA.LINK is a hands-on workshop on Application-Database Connectivity was a resounding success, empowering participants with practical insights into backend integration and real-world system design.',
      registrationLink: 'https://bit.ly/datalink-registrationform',
      image: './DATA.LINK.png',
      link: '#'
    },
    {
      title: 'IGNIS XR-AI: Learn, Hack, Relish – Crafting Tomorrow\'s AI Today!',
      date: 'November 7-9, 2024',
      time: '3:00 PM - 7:00 PM',
      location: 'Nalanda Auditorium, VBIT',
      attendees: '250',
      description: 'IGNIS XR-AI, a three-day event by DataVedhi.Club offered hands-on training in XR and AI through Unity sessions, real-world applications, and a collaborative hackathon.',
      image: './Ignis.png',
      link: '#',
      registrationLink: '#',
      gallerySlug: 'ignis-xr'
    },
    {
      title: 'BI Nexus: A Power BI Odyssey – A Resounding Success!',
      date: 'March 4, 2024',
      time: '3:00 PM - 7:00 PM',
      location: 'Nalanda Auditorium, VBIT',
      attendees: '250',
      description: 'Datavedhi.club hosted "BI Nexus" on March 4, 2024—a hands-on Power BI workshop that equipped students with key data visualization and analytics skills.',
      image: 'https://images.unsplash.com/photo-1552581234-26160f608093?w=800&h=400&fit=crop',
      link: '#',
      registrationLink: '#',
      gallerySlug: 'bi-nexus'
    },
    {
      title: 'TechFiesta 2K23 – A Grand Success!',
      date: 'October 28, 2023',
      time: '9:00 AM - 6:00 PM',
      location: 'Nalanda Auditorium, VBIT',
      attendees: '400',
      description: 'Datavedhi.club organized TechFiesta 2K23 at VBIT, a dynamic tech fest featuring competitions, a bootcamp, and a 24-hour hackathon to foster innovation, learning, and real-world tech skills.',
      image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&h=400&fit=crop',
      link: '#',
      registrationLink: '#'
    },
    {
      title: 'VAIDHUSHI: A FLAGSHIP EVENT',
      date: 'November 18, 2023',
      time: '6:00 PM - 10:00 PM',
      location: 'Nalanda Auditorium, VBIT',
      attendees: '300',
      description: 'Vaidushi is a bootcamp that introduces students to R programming and data mining through practical, real-world applications.',
      image: './Vaidushi.png',
      link: '#',
      registrationLink: '#',
      gallerySlug: 'vaidhushi'
    }
  ];

  const currentEvents = activeTab === 'upcoming' ? upcomingEvents : pastEvents;

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="section-academic hero-gradient text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">Events</h1>
            <p className="text-xl lg:text-2xl max-w-3xl mx-auto text-white/90">
              Discover enriching events that foster learning, networking, and academic excellence
            </p>
          </motion.div>
        </div>
      </section>

      {/* Events Filter */}
      <section className="py-8 bg-background border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <div className="flex bg-muted rounded-lg p-1">
              {['upcoming', 'past'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 rounded-md font-medium transition-all duration-300 ${
                    activeTab === tab
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Filter size={16} />
                    <span>{tab.charAt(0).toUpperCase() + tab.slice(1)} Events</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="section-academic bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            
            {currentEvents.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="card-academic text-center py-12 col-span-full"
              >
                <Calendar size={48} className="mx-auto text-secondary mb-4" />
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  {activeTab === 'upcoming' ? 'No upcoming events right now' : 'No events to display'}
                </h3>
                <p className="text-muted-foreground">
                  {activeTab === 'upcoming' ? 'Check back soon for new events!' : 'Please check back later.'}
                </p>
              </motion.div>
            ) : (
              currentEvents.map((event, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  className="card-academic overflow-hidden group hover:shadow-xl transition-shadow"
                >
                  <div className="flex flex-col h-full">
                    {/* Event Image */}
                    <div className="relative h-48 md:h-56 overflow-hidden">
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-4 right-4 bg-background/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold shadow-md">
                        {event.date}
                      </div>
                      {activeTab === 'upcoming' && (
                        <div className="absolute top-4 left-4 bg-green-500 text-black px-3 py-1 rounded-full text-xs font-bold shadow-md animate-pulse">
                          OPEN
                        </div>
                      )}
                    </div>

                    {/* Event Details */}
                    <div className="p-4 md:p-6 flex flex-col flex-1">
                      <h3 className="text-lg md:text-xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors line-clamp-2">
                        {event.title}
                      </h3>
                      
                      <div className="flex flex-wrap gap-3 md:gap-4 text-muted-foreground text-xs md:text-sm mb-4">
                        <div className="flex items-center gap-2">
                          <MapPin size={14} className="text-secondary flex-shrink-0" />
                          <span className="line-clamp-1">{event.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users size={14} className="text-secondary flex-shrink-0" />
                          <span>{event.attendees}</span>
                        </div>
                      </div>

                      {event.description && (
                        <p className="text-muted-foreground text-xs md:text-sm leading-relaxed mb-4 md:mb-6 flex-1 line-clamp-3">
                          {event.description}
                        </p>
                      )}

                      <div className="mt-auto pt-4 border-t border-border">
                        {activeTab === 'upcoming' ? (
                          <Link to={event.registrationLink || event.link || "#"} state={{ showAnimation: true }} className="w-full block">
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="btn-academic w-full text-sm md:text-base"
                            >
                              Register Now
                            </motion.button>
                          </Link>
                        ) : event.gallerySlug ? (
                          <Link to={`/events/gallery/${event.gallerySlug}`} className="w-full block">
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors"
                            >
                              View Gallery
                            </motion.button>
                          </Link>
                        ) : (
                          <span className="inline-flex items-center justify-center w-full px-4 py-2 bg-muted text-muted-foreground rounded-lg font-medium text-sm">
                            Event Completed
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Events;