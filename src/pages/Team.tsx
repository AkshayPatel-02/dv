import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Linkedin, Github } from 'lucide-react';

const Team = () => {
  const teamMembers = [
    {
      "name": "Bhragava Charan",
      "position": "President",
      "bio": "",
      "email": "",
      "linkedin": "",
      "image": "/Team/Bhargava_charan.png"
    },
    {
      "name": "ASHIK",
      "position": "Vice-President",
      "bio": "",
      "email": "",
      "linkedin": "",
      "image": "/Team/G.ASHIK.png"
    },
    {
      "name": "ShivaSai",
      "position": "Secretary",
      "bio": "",
      "email": "",
      "linkedin": "",
      "image": "/Team/ShivaSai.png"
    },
    {
      "name": "Sriram",
      "position": "Technical Lead",
      "bio": "",
      "email": "",
      "linkedin": "",
      "image": "/Team/Sriram.png"
    },
    {
      "name": "Akshay",
      "position": "Project Lead",
      "bio": "",
      "email": "",
      "linkedin": "",
      "image": "/Team/Akshay.png"
    },
    {
      "name": "Keerthana",
      "position": "Design Lead",
      "bio": "",
      "email": "",
      "linkedin": "",
      "image": "/Team/Keerthana.png"
    },
    {
      "name": "Bhumika Macharla",
      "position": "Documentation Lead",
      "bio": "",
      "email": "",
      "linkedin": "",
      "image": "/Team/Bhumika_Macharla.png"
    }
  ]

  const organizingCommittee = [
    {
      "name": "Shanmukh",
      "position": "Technical Team",
      "bio": "",
      "email": "",
      "linkedin": "",
      "image": "/Team/Shanmukh.png"
    },
     {
      "name": "Keerthi",
      "position": "Technical Team",
      "bio": "",
      "email": "",
      "linkedin": "",
      "image": "/Team/keerthi.png"
    },
     {
      "name": "Jyothsna",
      "position": "Technical Team",
      "bio": "",
      "email": "",
      "linkedin": "",
      "image": "/Team/Jyothsna.png"
    },
     {
      "name": "Hamsika",
      "position": "Technical Team",
      "bio": "",
      "email": "",
      "linkedin": "",
      "image": "/Team/Hamsika.png"
    }, 
    {
      "name": "Akhil",
      "position": "Project Team",
      "bio": "",
      "email": "",
      "linkedin": "",
      "image": "/Team/V_Akhil.png"
    },
    {
      "name": "Sathwik",
      "position": "Project Team",
      "bio": "",
      "email": "",
      "linkedin": "",
      "image": "/Team/Sathwik.png"
    },
     {
      "name": "Varshini",
      "position": "Project Team",
      "bio": "",
      "email": "",
      "linkedin": "",
      "image": "/Team/Varshini.png"
    },
     {
      "name": "Anjali",
      "position": "Project Team",
      "bio": "",
      "email": "",
      "linkedin": "",
      "image": "/Team/Anjali.png"
    },
     {
      "name": "Yashwanth",
      "position": "Design Team",
      "bio": "",
      "email": "",
      "linkedin": "",
      "image": "/Team/Yashwanth.png"
    },
    {
      "name": "Shashank",
      "position": "Design Team",
      "bio": "",
      "email": "",
      "linkedin": "",
      "image": "/Team/Shashank.png"
    },
     {
      "name": "Sanjana",
      "position": "Design Team",
      "bio": "",
      "email": "",
      "linkedin": "",
      "image": "/Team/Sanjana.png"
    },
     {
      "name": "Akash",
      "position": "Design Team",
      "bio": "",
      "email": "",
      "linkedin": "",
      "image": "/Team/Akash.png"
    },
     {
      "name": "Deekshitha",
      "position": "Documentation Team",
      "bio": "",
      "email": "",
      "linkedin": "",
      "image": "/Team/Deekshitha.png"
    },
     {
      "name": "Abhinaya",
      "position": "Documentation Team",
      "bio": "",
      "email": "",
      "linkedin": "",
      "image": "/Team/Abhinaya.png"
    },
     {
      "name": "Om Phaneendra",
      "position": "Documentation Team",
      "bio": "",
      "email": "",
      "linkedin": "",
      "image": "/Team/Om_Phaneendra.png"
    },
     {
      "name": "Rohith Sri",
      "position": "Documentation Team",
      "bio": "",
      "email": "",
      "linkedin": "",
      "image": "/Team/Rohith_Sri.png"
    },
  ]

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
            <h1 className="text-4xl lg:text-6xl font-bold mb-6">Our Team</h1>
            <p className="text-xl lg:text-2xl max-w-3xl mx-auto text-white/90">
              Meet the dedicated leaders driving our mission of academic excellence and community growth
            </p>
          </motion.div>
        </div>
      </section>

      {/* Team Members Section */}
      <section className="section-academic bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-foreground">Current Executive Committee</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Our leadership team brings together diverse perspectives and expertise to guide our club toward continued success
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div
                key={member.name}
                className="card-academic text-center group"
              >
                <div className="relative mb-6">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-32 h-32 mx-auto rounded-full object-cover object-top border-4 border-secondary/20 group-hover:border-secondary transition-colors duration-300"
                  />
                  <div className="absolute inset-0 w-32 h-32 mx-auto rounded-full bg-gradient-to-t from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                <h3 className="text-xl font-semibold mb-2 text-foreground">{member.name}</h3>
                <p className="text-secondary font-medium mb-4">{member.position}</p>
                <p className="text-muted-foreground leading-relaxed mb-6">{member.bio}</p>

                {/* Social Links */}
                <div className="flex justify-center space-x-4">
                  <a
                    href={`mailto:${member.email}`}
                    className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    <Mail size={18} />
                  </a>
                  <a
                    href={member.linkedin}
                    className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    <Linkedin size={18} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <hr className="border-t border-club-teal/20" />
      </div>

      {/* Organizing Committee Section */}
      <section className="section-academic bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-foreground">Organizing Committee</h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              The passionate individuals who bring our events and initiatives to life
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {organizingCommittee.map((member, index) => (
              <div
                key={member.name}
                className="card-academic text-center group"
              >
                <div className="relative mb-6">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-32 h-32 mx-auto rounded-full object-cover object-top border-4 border-secondary/20 group-hover:border-secondary transition-colors duration-300"
                  />
                  <div className="absolute inset-0 w-32 h-32 mx-auto rounded-full bg-gradient-to-t from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                <h3 className="text-xl font-semibold mb-2 text-foreground">{member.name}</h3>
                <p className="text-secondary font-medium mb-4">{member.position}</p>
                <p className="text-muted-foreground leading-relaxed mb-6">{member.bio}</p>

                {/* Social Links   .. */}
                <div className="flex justify-center space-x-4">
                  <a
                    href={`mailto:${member.email}`}
                    className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    <Mail size={18} />
                  </a>
                  <a
                    href={member.linkedin}
                    className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    <Linkedin size={18} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Team;