import React from 'react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { Shield, Lock, EyeOff, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

const About = () => {
  return (
    <div className="min-h-screen bg-warm-white font-sans flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-5xl font-serif text-text-primary mb-6">Our Mission</h1>
            <p className="text-xl text-text-secondary leading-relaxed">
              To provide everyone with a safe, truly anonymous space to seek mental health support without fear of stigma or data exposure.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 mb-20">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="w-12 h-12 bg-sage-medium/30 rounded-xl flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-brand-teal" />
              </div>
              <h3 className="text-2xl font-serif text-text-primary mb-3">Radical Privacy</h3>
              <p className="text-text-secondary leading-relaxed">
                We believe privacy is a fundamental human right, especially regarding mental health. That's why we don't ask for your real name, and we end-to-end encrypt every conversation.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="w-12 h-12 bg-trust-purple-light rounded-xl flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-trust-purple" />
              </div>
              <h3 className="text-2xl font-serif text-text-primary mb-3">Expert Care</h3>
              <p className="text-text-secondary leading-relaxed">
                Anonymity doesn't mean compromising on quality. Every professional on our platform undergoes a rigorous vetting and credential verification process.
              </p>
            </motion.div>
          </div>

          <div className="bg-sage-light rounded-3xl p-8 md:p-12">
            <h2 className="text-3xl font-serif text-text-primary mb-6 text-center">How It Works</h2>
            <div className="space-y-8">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-brand-teal text-warm-white flex items-center justify-center font-bold flex-shrink-0">1</div>
                <div>
                  <h4 className="text-xl font-medium text-text-primary mb-2">Create an Alias</h4>
                  <p className="text-text-secondary">No real name required. Connect with an alias that makes you feel comfortable.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-brand-teal text-warm-white flex items-center justify-center font-bold flex-shrink-0">2</div>
                <div>
                  <h4 className="text-xl font-medium text-text-primary mb-2">Find a Professional</h4>
                  <p className="text-text-secondary">Browse our directory of verified experts and find someone who matches your needs.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-brand-teal text-warm-white flex items-center justify-center font-bold flex-shrink-0">3</div>
                <div>
                  <h4 className="text-xl font-medium text-text-primary mb-2">Connect Securely</h4>
                  <p className="text-text-secondary">Chat or start a session knowing your data is encrypted and completely secure.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;
