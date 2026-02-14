import React from 'react';
import { motion } from 'framer-motion';
import { Eye, Target, Calendar, Users, Award, Rocket } from 'lucide-react';

const About = () => {
  const timelineEvents = [
    {
      year: 'OCT , 2022',
      title: 'Foundation',
      description: 'Academic Excellence Club was founded by a group of passionate students dedicated to academic growth.'
    },
    {
      year: 'NOV , 2022',
      title: 'VAIDHUSHI: A FLAGSHIP EVENT',
      description: 'Vaidushi is a bootcamp that introduces students to R programming and data mining through practical, real-world applications.'
    },
    {
      year: 'FEB , 2023',
      title: 'TechFiesta 2K23',
      description: 'Datavedhi.club organized TechFiesta 2K23 at VBIT, a dynamic tech fest featuring competitions, a bootcamp, and a 24-hour hackathon to foster innovation, learning, and real-world tech skills.'
    },
    {
      year: 'MAR , 2024',
      title: 'BI Nexus: A Power BI Odyssey ',
      description: 'Datavedhi.club hosted "BI Nexus" on March 4, 2024—a hands-on Power BI workshop that equipped students with key data visualization and analytics skills.'
    },
    {
      year: 'NOV , 2024', 
      title: 'IGNIS XR-AI Hackathon',
      description: 'Datavedhi.club hosted "BI Nexus" on March 4, 2024—a hands-on Power BI workshop that equipped students with key data visualization and analytics skills.'
    },
    {
      year: 'JUL , 2025',
      title: 'DATA.LINK',
      description: 'DATA.LINK – A hands-on workshop on app-database connectivity. Learn how data flows between applications and databases in real-world systems.'
    },
    {
      year: 'OCT , 2025',
      title: 'ContribX',
      description: 'ContribX is a hands-on workshop that empowers students to contribute to open-source projects,fostering collaboration and real-world coding experience in the open-source ecosystem.'
    }
  ];

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
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">About Us</h1>
            <p className="text-xl lg:text-2xl max-w-3xl mx-auto text-white/90">
              Discover our mission, vision, and the journey that has shaped our commitment to academic excellence
            </p>
          </motion.div>
        </div>
      </section>

      {/* Vision & Mission Section */}
      <section className="section-academic bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Vision */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="card-academic"
            >
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mb-6">
                <Eye className="h-8 w-8 text-secondary" />
              </div>
              <h2 className="text-3xl font-bold mb-6 text-foreground">Our Vision</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
              To be a leading Data Science community that nurtures innovation through 
hackathons, flagship events, and workshops. Empower students with industry
relevant skills to solve real-world data challenges. Foster a culture of continuous 
learning, collaboration, and technological advancement in AI, Machine Learning, and 
Data Analytics.
              </p>
              <ul className="mt-6 space-y-3">
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <span className="text-muted-foreground">Establishing a prominent Data Science community where innovation is celebrated 
                  through hackathons, flagship events, and workshops. </span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <span className="text-muted-foreground">To empower students with industry-relevant skills to solve real-world data challenges. </span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <span className="text-muted-foreground">To foster a culture of continuous learning, collaboration, and technological advancement 
                  in AI, Machine Learning, and Data Analytics. </span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <span className="text-muted-foreground">To create opportunities for students to engage with industry experts and gain real-world 
                  exposure in Data Science. </span>
                </li>
              </ul>
              {/* <p className="text-lg text-muted-foreground leading-relaxed mt-4">
              To be a leading Data Science community that nurtures innovation through hackathons, flagship events, and workshops. Empower students with industry-relevant skills to solve real-world data challenges. Foster a culture of continuous learning, collaboration, and technological advancement in AI, Machine Learning, and Data Analytics.
              </p> */}
            </motion.div>

            {/* Mission */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="card-academic"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-3xl font-bold mb-6 text-foreground">Our Mission</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
              To cultivate a dynamic learning environment by organizing hackathons, flagship 
events, and workshops in Data Science. Equip students with practical skills in AI, 
Machine Learning, and Data Analytics through hands-on experience. Bridge the gap 
between academia and industry, empowering future data professionals to solve real
world challenges.
              </p>
              <ul className="mt-6 space-y-3">
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <span className="text-muted-foreground">Creating a dynamic learning environment by organizing hackathons, flagship events, and 
                  workshops in Data Science</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <span className="text-muted-foreground">To equip students with practical skills in AI, Machine Learning, and Data Analytics through 
                  hands-on experience.</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <span className="text-muted-foreground">Empowering students in their journey to become data professionals by bridging the gap 
                  between academia and industry.</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <span className="text-muted-foreground">Fostering creativity and collaboration through mentorship, research, and knowledge-sharing 
                  initiatives in Data Science.</span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="section-academic bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-foreground">Our Core Values</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              These values guide our actions and define who we are as a community
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: 'Collaboration',
                description: 'We believe in the power of working together to achieve common goals and support each other\'s growth.'
              },
              {
                icon: Award,
                title: 'Excellence',
                description: 'We strive for the highest standards in everything we do, continuously pushing the boundaries of achievement.'
              },
              {
                icon: Rocket,
                title: 'Innovation',
                description: 'We embrace creative thinking and encourage new ideas that challenge conventional approaches.'
              }
            ].map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                className="card-academic text-center"
              >
                <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <value.icon className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold mb-4 text-foreground">{value.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="section-academic bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-foreground">Our Journey</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Explore the milestones and achievements that have shaped our club's history
            </p>
          </motion.div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-secondary"></div>

            <div className="space-y-12">
              {timelineEvents.map((event, index) => (
                <motion.div
                  key={event.year}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.6 }}
                  className={`relative flex items-center ${
                    index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  {/* Timeline dot */}
                  <div className="absolute left-8 md:left-1/2 w-4 h-4 bg-secondary rounded-full transform -translate-x-2 md:-translate-x-1/2 border-4 border-background z-10"></div>

                  {/* Content */}
                  <div className={`w-full md:w-5/12 ml-16 md:ml-0 ${index % 2 === 0 ? 'md:pr-12' : 'md:pl-12'}`}>
                    <div className="card-academic">
                      <div className="flex items-center mb-4">
                        <Calendar className="h-5 w-5 text-secondary mr-3" />
                        <span className="text-2xl font-bold text-secondary">{event.year}</span>
                      </div>
                      <h3 className="text-xl font-semibold mb-3 text-foreground">{event.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{event.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;