import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, Filter } from 'lucide-react';

const Events = () => {
  const [activeTab, setActiveTab] = useState('upcoming');

  const upcomingEvents = [
    
    
  ];

  const pastEvents = [
    {
      title: 'ContribX',
      date: 'October 24-25, 2025',
      time: '10:00 AM - 4:20 PM',
      location: 'Nalanda Auditorium , VBIT',
      attendees: '250+',
      description: 'ContribX is a hands-on workshop focusing on Git, GitHub, and Open Source contributions.The two-day event included hands-on training for version control, collaborative development, and a "Fixathon" for debugging real-world projects.',
      registrationLink: 'https://bit.ly/ContribX-registrationform',
      image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&h=400&fit=crop'
    },
    {
      title: 'DATA.LINK',
      date: 'March 15, 2024',
      time: '9:00 AM - 5:00 PM',
      location: 'Nalanda Auditorium , VBIT',
      attendees: '200+',
      description: 'DATA.LINK is a hands-on workshop on Application-Database Connectivity was a resounding success, empowering participants with practical insights into backend integration and real-world system design.',
      registrationLink: 'https://bit.ly/datalink-registrationform',
      image: './DATA.LINK.png'
    },     
    {
      title: 'IGNIS XR-AI: Learn, Hack, Relish – Crafting Tomorrow\'s AI Today!',
      date: 'September 15, 2023',
      time: '3:00 PM - 7:00 PM',
      location: 'Nalanda Auditorium , VBIT',
      attendees: '250',
      description: 'IGNIS XR-AI, a three-day event by DataVedhi.Club from Nov 7–9, 2024, offered hands-on training in XR and AI through Unity sessions, real-world applications, and a collaborative hackathon.',
      image: './Ignis.png'
    },
    
    {
      title: 'BI Nexus: A Power BI Odyssey – A Resounding Success!',
      date: 'September 15, 2023',
      time: '3:00 PM - 7:00 PM',
      location: 'Nalanda Auditorium , VBIT',
      attendees: '250',
      description: 'Datavedhi.club hosted "BI Nexus" on March 4, 2024—a hands-on Power BI workshop that equipped students with key data visualization and analytics skills.',
      image: 'https://images.unsplash.com/photo-1552581234-26160f608093?w=800&h=400&fit=crop'
    },
    
    {
      title: 'TechFiesta 2K23 – A Grand Success! ',
      date: 'October 28, 2023',
      time: '9:00 AM - 6:00 PM',
      location: 'Nalanda Auditorium , VBIT',
      attendees: '400',
      description: 'Datavedhi.club organized TechFiesta 2K23 at VBIT, a dynamic tech fest featuring competitions, a bootcamp, and a 24-hour hackathon to foster innovation, learning, and real-world tech skills.',
      image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&h=400&fit=crop'
    },
    {
      title: 'VAIDHUSHI: A FLAGSHIP EVENT',
      date: 'November 18, 2023',
      time: '6:00 PM - 10:00 PM',
      location: 'Nalanda Auditorium , VBIT',
      attendees: '300',
      description: 'Vaidushi is a bootcamp that introduces students to R programming and data mining through practical, real-world applications.',
      image: './Vaidushi.png'
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

      {/* Events List */}
      <section className="section-academic bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-8">
            {currentEvents.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="card-academic text-center py-12"
              >
                <div className="flex justify-center mb-4">
                  <Calendar size={48} className="text-secondary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  {activeTab === 'upcoming' ? 'No upcoming events right now' : 'No events to display'}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {activeTab === 'upcoming'
                    ? 'There are no upcoming events at present. Got any guesses for our next event?'
                    : 'Please check back later.'}
                </p>
                {activeTab === 'upcoming' && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-academic inline-block"
                    onClick={() => {
                      // Handle the action here instead of navigating
                      window.location.href = '/contact';
                      // You can add your custom logic here
                    }}
                  >
                    Share a guess
                  </motion.button>
                )}
              </motion.div>
            ) : (
              currentEvents.map((event, index) => (
                <motion.div
                  key={event.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  className="card-academic overflow-hidden"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Event Image */}
                    <div className="lg:col-span-1">
                      <img
                        src={event.image}
                        alt={event.title}
                        className="w-full h-64 lg:h-full object-cover rounded-lg"
                      />
                    </div>

                    {/* Event Details */}
                    <div className="lg:col-span-2 space-y-4">
                      <h3 className="text-2xl lg:text-2xl font-bold text-foreground">
                        {event.title}
                      </h3>
                      
                      <div className="flex flex-wrap gap-6 text-muted-foreground">
                        {/* <div className="flex items-center space-x-2">
                          <Calendar size={18} className="text-secondary" />
                          <span>{event.date}</span>
                        </div> */}
                        <div className="flex items-center space-x-2">
                          <MapPin size={18} className="text-secondary" />
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users size={18} className="text-secondary" />
                          <span>{event.attendees} attendees</span>
                        </div>
                      </div>

                      <p className="text-lg text-muted-foreground leading-relaxed">
                        {event.description}
                      </p>

                      <div className="pt-4">
                        {activeTab === 'upcoming' ? (
                          <a
                            href={event.registrationLink || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="btn-academic"
                            >
                              Register Now
                            </motion.button>
                          </a>
                        ) : (
                          <span className="inline-flex items-center px-4 py-2 bg-muted text-muted-foreground rounded-lg">
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

      {/* Event Categories
      <section className="section-academic bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-foreground">Event Categories</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              We organize diverse events to support different aspects of academic and personal development
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Conferences', description: 'Large-scale academic gatherings' },
              { title: 'Workshops', description: 'Skill-building sessions' },
              { title: 'Networking', description: 'Professional connections' },
              { title: 'Competitions', description: 'Academic challenges' }
            ].map((category, index) => (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                className="card-academic text-center"
              >
                <h3 className="text-xl font-semibold mb-3 text-foreground">{category.title}</h3>
                <p className="text-muted-foreground">{category.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section> */}
    </div>
  );
};

export default Events;