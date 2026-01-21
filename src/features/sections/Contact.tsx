import { Github, Linkedin, Mail, MapPin, Phone, Send, Twitter } from 'lucide-react';
import { useState } from "react";
import { NextPageArrow } from "../../shared/components/NextPageArrow";

export function Contact() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData(e.target);

    const payload = {
      type: "contact-message",
      name: formData.get("name"),
      telegram: formData.get("telegram"),
      email: formData.get("email"),
      subject: formData.get("subject"),
      message: formData.get("message"),
    };

    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-email`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify(payload)
      }
    );

    if (res.ok) {
      setSubmitted(true);
      e.target.reset(); // Clear form

      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        setSubmitted(false);
      }, 3000);
    } else {
      alert("Failed to send message. Try again.");
    }

    setSubmitting(false);
  };

  return (
    <section id="contact" className="relative min-h-screen py-6 px-6 bg-white dark:bg-gray-900">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">Get In Touch</h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-teal-500 mx-auto rounded-full mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Have a project in mind? Let's work together to create something amazing!
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">

          {/* LEFT SIDE */}
          <div className="space-y-8">
            <div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Contact Information</h3>

              <div className="space-y-4">

                {/* Email */}
                <div className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-gray-800 rounded-lg hover:shadow-md transition-shadow">
                  <Mail className="text-blue-600 mt-1" size={24} />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Email</p>
                    <a 
                      href="mailto:contact.sharmag02@gmail.com"
                      className="text-slate-900 dark:text-white font-semibold hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      contact.sharmag02@gmail.com
                    </a>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-gray-800 rounded-lg hover:shadow-md transition-shadow">
                  <Phone className="text-blue-600 mt-1" size={24} />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Phone</p>
                    <a 
                      href="tel:+9197083xxxxx"
                      className="text-slate-900 dark:text-white font-semibold hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      +91 9708* 3***5
                    </a>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-gray-800 rounded-lg hover:shadow-md transition-shadow">
                  <MapPin className="text-blue-600 mt-1" size={24} />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Location</p>
                    <p className="text-slate-900 dark:text-white font-semibold">Hajipur, Bihar, India</p>
                  </div>
                </div>

              </div>
            </div>

            {/* Social */}
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Connect With Me</h3>
              <div className="flex gap-4">
                <a 
                  href="https://github.com/.sharmag02"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 bg-slate-50 dark:bg-white-800 rounded-lg hover:bg-blue-600 hover:text-white transition-all hover:scale-110"
                >
                  <Github size={24} />
                </a>
                <a 
                  href="https://linkedin.com/in/sharmag02"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 bg-slate-50 dark:bg-white-800 rounded-lg hover:bg-blue-600 hover:text-white transition-all hover:scale-110"
                >
                  <Linkedin size={24} />
                </a>
                <a 
                  href="https://twitter.com/sharmag02off"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 bg-slate-50 dark:bg-white-800 rounded-lg hover:bg-blue-600 hover:text-white transition-all hover:scale-110"
                >
                  <Twitter size={24} />
                </a>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE - FORM */}
          <div>
            {submitted ? (
              <div className="bg-green-50 dark:bg-green-900 p-10 rounded-2xl shadow-lg text-center">
                <h3 className="text-2xl font-bold text-green-700 dark:text-green-300 mb-3">Message Sent Successfully! 🎉</h3>
                <p className="text-gray-700 dark:text-gray-200">
                  Thank you for reaching out. I will get back to you shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-slate-50 dark:bg-gray-800 rounded-2xl p-8 shadow-lg">

                {/* Name */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                    Your Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full px-4 py-3 bg-white dark:bg-gray-700 text-slate-900 dark:text-slate-100 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-blue-500 transition-colors"
                    placeholder="Your Name"
                  />
                </div>

                {/* Telegram */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                    Your Telegram Id
                  </label>
                  <input
                    type="text"
                    name="telegram"
                    required
                    className="w-full px-4 py-3 bg-white dark:bg-gray-700 text-slate-900 dark:text-slate-100 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-blue-500 transition-colors"
                    placeholder="@telegramid"
                  />
                </div>

                {/* Email */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full px-4 py-3 bg-white dark:bg-gray-700 text-slate-900 dark:text-slate-100 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-blue-500 transition-colors"
                    placeholder="Please fill the correct email so that I can reply back."
                  />
                </div>

                {/* Subject */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    name="subject"
                    required
                    className="w-full px-4 py-3 bg-white dark:bg-gray-700 text-slate-900 dark:text-slate-100 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-blue-500 transition-colors"
                    placeholder="Project Inquiry"
                  />
                </div>

                {/* Message */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-slate-900 dark:text-white mb-2">
                    Message
                  </label>
                  <textarea
                    name="message"
                    rows={3}
                    required
                    className="w-full px-4 py-3 bg-white dark:bg-gray-700 text-slate-900 dark:text-slate-100 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:border-blue-500 transition-colors resize-none"
                    placeholder="Tell me about your project..."
                  ></textarea>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/50 transition-all duration-300 hover:-translate-y-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Sending..." : (
                    <>
                      Send Message
                      <Send size={20} />
                    </>
                  )}
                </button>

              </form>
            )}
          </div>

        </div>
      </div>

      <NextPageArrow />
    </section>
  );
}
