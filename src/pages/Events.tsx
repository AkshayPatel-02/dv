import React, { useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Calendar, MapPin, Users, Filter, ArrowRight, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';

// ========================================
// 🎮 3D TILT CARD COMPONENT (Beast Mode)
// ========================================
interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
}

const TiltCard = ({ children, className = '', glowColor = "rgba(34,197,94,0.5)" }: TiltCardProps) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 500, damping: 100 });
  const mouseY = useSpring(y, { stiffness: 500, damping: 100 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { currentTarget, clientX, clientY } = e;
    const rect = currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((clientX - centerX) / 2);
    y.set((clientY - centerY) / 2);
  };

  const rotateX = useTransform(mouseY, [-150, 150], [8, -8]);
  const rotateY = useTransform(mouseX, [-150, 150], [-8, 8]);

  return (
    <motion.div
      style={{ perspective: 1000 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      className={`relative h-full ${className}`}
    >
      <motion.div
        style={{ 
          rotateX, 
          rotateY,
          transformStyle: "preserve-3d"
        }}
        className="h-full"
      >
        <div style={{ transform: "translateZ(40px)" }}>
          {children}
        </div>
        
        {/* Glow Effect */}
        <div 
          className="absolute inset-0 -z-10 blur-2xl opacity-0 group-hover:opacity-60 transition-opacity duration-500" 
          style={{ background: `radial-gradient(circle at 50% 50%, ${glowColor}, transparent 70%)` }}
        />
      </motion.div>
    </motion.div>
  );
};

// ========================================
// 🎯 MAIN EVENTS COMPONENT
// ========================================
const Events = () => {
  const [activeTab, setActiveTab] = useState('upcoming');

  // 📌 UPCOMING EVENTS - Frame2Reality with special styling
  const upcomingEvents = [
    {
      title: 'FRAME2REALITY',
      subtitle: 'GAME DEV & METAVERSE',
      date: 'FEB 17-18, 2026',
      location: 'Nalanda Auditorium, VBIT',
      attendees: 'Registration Open',
      description: 'Master Unity 3D and build AR Applications in this intensive 2-Day bootcamp. From wireframes to deployed apps.',
      image: 'https://images.unsplash.com/photo-1614726365723-49cfae968603?q=80&w=2670&auto=format&fit=crop',
      link: '/frame2reality',
      isSpecial: true,
    }
  ];

  // 📌 PAST EVENTS - Your original events, preserved exactly
  const pastEvents = [
    {
      title: 'DATA.LINK',
      date: 'March 15, 2024',
      time: '9:00 AM - 5:00 PM',
      location: 'Nalanda Auditorium, VBIT',
      attendees: '200+',
      description: '',
      registrationLink: 'https://bit.ly/datalink-registrationform',
      image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop'
    },
    {
      title: 'IGNIS XR-AI: Learn, Hack, Relish – Crafting Tomorrow\'s AI Today!',
      date: 'November 7-9, 2024',
      time: '3:00 PM - 7:00 PM',
      location: 'Nalanda Auditorium, VBIT',
      attendees: '250',
      description: 'IGNIS XR-AI, a three-day event by DataVedhi.Club offered hands-on training in XR and AI through Unity sessions, real-world applications, and a collaborative hackathon.',
      image: './Ignis.png'
    },
    {
      title: 'BI Nexus: A Power BI Odyssey – A Resounding Success!',
      date: 'March 4, 2024',
      time: '3:00 PM - 7:00 PM',
      location: 'Nalanda Auditorium, VBIT',
      attendees: '250',
      description: 'Datavedhi.club hosted "BI Nexus" on March 4, 2024—a hands-on Power BI workshop that equipped students with key data visualization and analytics skills.',
      image: 'https://images.unsplash.com/photo-1552581234-26160f608093?w=800&h=400&fit=crop'
    },
    {
      title: 'TechFiesta 2K23 – A Grand Success!',
      date: 'October 28, 2023',
      time: '9:00 AM - 6:00 PM',
      location: 'Nalanda Auditorium, VBIT',
      attendees: '400',
      description: 'Datavedhi.club organized TechFiesta 2K23 at VBIT, a dynamic tech fest featuring competitions, a bootcamp, and a 24-hour hackathon to foster innovation, learning, and real-world tech skills.',
      image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=800&h=400&fit=crop'
    },
    {
      title: 'VAIDHUSHI: A FLAGSHIP EVENT',
      date: 'November 18, 2023',
      time: '6:00 PM - 10:00 PM',
      location: 'Nalanda Auditorium, VBIT',
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
                // ============================================
                // 🎮 SPECIAL BEAST MODE CARD (Frame2Reality)
                // ============================================
                event.isSpecial ? (
                  <Link 
                    key={index} 
                    to={event.link} 
                    state={{ showAnimation: true }}
                    className="block h-[450px] md:h-[500px] group"
                  >
                    <TiltCard className="h-full">
                      <div className="relative h-full bg-black border-2 border-green-500/50 rounded-2xl overflow-hidden shadow-2xl shadow-green-500/20 hover:shadow-green-500/40 transition-shadow duration-500">
                        
                        {/* Background Image with Overlay */}
                        <div className="absolute inset-0">
                          <img 
                            src={event.image}
                            alt={event.title}
                            className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
                          
                          {/* Scanline Effect */}
                          <div className="absolute inset-0 opacity-10" 
                               style={{
                                 backgroundImage: 'linear-gradient(0deg, transparent 50%, rgba(34,197,94,0.5) 50%)',
                                 backgroundSize: '100% 4px'
                               }} 
                          />
                        </div>

                        {/* Content */}
                        <div className="relative z-10 h-full p-6 md:p-8 flex flex-col">
                          
                          {/* Badge */}
                          <div className="flex justify-between items-start mb-4">
                            <div className="bg-green-500 text-black text-xs font-black px-2 md:px-3 py-1 md:py-1.5 transform -skew-x-12 animate-pulse shadow-lg">
                              <span className="block skew-x-12">REGISTRATION OPEN</span>
                            </div>
                            <Zap className="text-green-400 animate-pulse" size={20} />
                          </div>

                          {/* Title Section (at bottom) */}
                          <div className="mt-auto">
                            <h3 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-1 italic tracking-tighter" 
                                style={{ 
                                  textShadow: '0 0 30px rgba(34,197,94,0.6), 2px 2px 0px #000',
                                  fontFamily: 'Impact, sans-serif'
                                }}>
                              {event.title}
                            </h3>
                            
                            <p className="text-green-400 font-mono text-xs tracking-wider mb-3 md:mb-4">
                              {event.subtitle}
                            </p>

                            <p className="text-gray-300 text-xs md:text-sm mb-4 md:mb-6 line-clamp-2 border-l-2 border-green-500 pl-3">
                              {event.description}
                            </p>

                            {/* Info Row */}
                            <div className="flex flex-wrap items-center gap-3 md:gap-4 text-gray-400 text-xs mb-4 md:mb-6">
                              <div className="flex items-center gap-1">
                                <Calendar size={14} className="text-green-500" />
                                <span className="hidden sm:inline">{event.date}</span>
                                <span className="sm:hidden">FEB 17-18</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MapPin size={14} className="text-green-500" />
                                <span className="hidden sm:inline">{event.location}</span>
                                <span className="sm:hidden">VBIT</span>
                              </div>
                            </div>

                            {/* CTA Button */}
                            <button className="w-full bg-green-600 hover:bg-green-500 text-black font-black py-3 md:py-4 px-4 md:px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-green-500/50 transform hover:scale-105 text-sm md:text-base">
                              REGISTER NOW
                              <ArrowRight size={18} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </TiltCard>
                  </Link>
                ) : (
                  // ============================================
                  // 📋 STANDARD CARD (Past Events)
                  // ============================================
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
                            <a
                              href={event.registrationLink || "#"}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full"
                            >
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="btn-academic w-full text-sm md:text-base"
                              >
                                Register Now
                              </motion.button>
                            </a>
                          ) : (
                            <span className="inline-flex items-center justify-center w-full px-4 py-2 bg-muted text-muted-foreground rounded-lg font-medium text-sm">
                              Event Completed
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Events;