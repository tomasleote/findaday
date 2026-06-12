import React from 'react';
import { Calendar, Users, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '../../../shared/ui';

const HOW_IT_WORKS_STEPS = [
  { icon: <Calendar size={24} />, title: '1. Create', desc: 'Set a date range and share the link with your group.' },
  { icon: <Users size={24} />, title: '2. Respond', desc: 'Everyone marks their free days on the calendar.' },
  { icon: <Sparkles size={24} />, title: '3. Match', desc: 'The algorithm finds the best overlapping dates instantly.' },
];

const USE_CASES = [
  { title: 'The Weekend Getaway', desc: 'Finding overlap for a 3-day cabin trip among 8 busy friends.' },
  { title: 'Friends Christmas Dinner', desc: 'Coordinating the single best evening for a large friend group to get together before everyone travels to see their families.' },
  { title: 'The Remote Team', desc: 'Finding a week where the entire distributed startup can fly in for a company offsite.' },
];

const FAQS = [
  { q: 'How does this group availability tool work?', a: 'Create your event by selecting a range of possible dates. Share the generated link in your group chat. Everyone clicks the link and taps the days they are free. The app instantly generates a visual heatmap showing which date has the most overlap.' },
  { q: 'Is it really free, or are there hidden ads?', a: 'Find A Day is 100% free group scheduling. There are no paywalls, no participant limits, and absolutely no ads to interrupt your friends when they respond to your invite.' },
  { q: 'Do my friends need to create an account?', a: 'No. One of our core philosophies is zero friction. Participants do not need to download an app, create an account, or log in. They just enter their name, select their dates, and submit.' },
  { q: 'Can I use this for multi-day events like vacations?', a: 'Yes! Unlike old-school tools built for 30-minute time slots, Find A Day specializes in multi-day scheduling. You can find the best 4-day stretch for a group vacation just as easily as finding one evening for dinner.' },
  { q: 'How many people can join an event?', a: 'There is no hard limit on participants. Whether you are finding a date for a 4-person D&D group or querying availability for a 50-person family reunion, the heatmap handles the data seamlessly.' },
  { q: 'Will this work on mobile phones?', a: 'Yes, the entire interface is optimized for mobile tapping. Since most scheduling happens via links dropped in iMessage or WhatsApp, we ensured the availability grid is highly responsive on all screen sizes.' },
];

export function HowItWorksSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl w-full"
    >
      {HOW_IT_WORKS_STEPS.map((step, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
        >
          <Card variant="subtle" className="text-center h-full">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-500/10 text-brand-400 mb-4">
              {step.icon}
            </div>
            <h3 className="font-bold text-gray-50 mb-2">{step.title}</h3>
            <p className="text-sm text-gray-400">{step.desc}</p>
          </Card>
        </motion.div>
      ))}
    </motion.div>
  );
}

export function HomePageSeoSections() {
  return (
    <div className="w-full max-w-5xl mx-auto mt-32 space-y-24 px-4 text-left">
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl font-bold text-white mb-6">The Universal Scheduling Problem</h2>
        <div className="space-y-4 text-lg text-gray-400 leading-relaxed">
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            You want to get a group together. You drop the inevitable "when is everyone free?" into the group chat. What follows is a chaotic spiral of conflicting answers. Three people can do Friday, two say Saturday, and four haven't replied at all. Trying to coordinate a group schedule manually becomes a full-time job for the organizer. The larger the group, the harder it is to find a day that actually works for everyone.
          </motion.p>
          <motion.p
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Traditional group availability tools haven't evolved. Some force you to create accounts before you can launch a poll. Others bombard your friends with intrusive ads just to submit their availability. And most are built for one-hour corporate meetings, making them completely useless if you're trying to schedule a multi-day trip or an open-ended weekend.
          </motion.p>
        </div>
      </motion.section>

      <section>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl font-bold text-white mb-8"
        >
          Built for Every Kind of Event
        </motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {USE_CASES.map((uc, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className="bg-dark-900 border border-dark-800 p-6 rounded-2xl relative overflow-hidden group hover:border-dark-700 hover:-translate-y-1 transition-all"
            >
              <h3 className="text-xl font-bold text-white mb-3 text-brand-400">{uc.title}</h3>
              <p className="text-gray-400 leading-relaxed">{uc.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="max-w-3xl mx-auto pb-32">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-3xl font-bold text-white mb-10 text-center"
        >
          Frequently Asked Questions
        </motion.h2>
        <div className="space-y-4">
          {FAQS.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="bg-dark-900 border border-dark-800 rounded-2xl overflow-hidden p-6"
            >
              <h3 className="font-bold text-gray-200 text-lg mb-2">{faq.q}</h3>
              <p className="text-gray-400 leading-relaxed text-base md:text-lg">{faq.a}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
