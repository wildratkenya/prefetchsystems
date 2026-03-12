import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { MapPin, Phone, Mail, Clock, Send, Check, Loader2 } from 'lucide-react';
const CONTACT_BG = 'https://d64gsuwffb70l.cloudfront.net/699d972a092ab1414cf6bcff_1771935954397_d9c0211d.jpg';
const ContactPage: React.FC = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    const {
      error
    } = await supabase.from('contact_submissions').insert({
      name: form.name,
      email: form.email,
      phone: form.phone,
      subject: form.subject,
      message: form.message
    });
    if (error) {
      setStatus('error');
    } else {
      setStatus('sent');
      setForm({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    }

    // Track analytics
    supabase.from('site_analytics').insert({
      page: '/contact',
      event_type: 'contact_form_submit'
    });
  };
  return <div className="min-h-screen">
      {/* Hero with printer background */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://d64gsuwffb70l.cloudfront.net/699c6111136bd966ef67d342_1771939195652_435e4f55.webp" alt="Office" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0f1f38]/95 to-[#0f1f38]/80" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Get in Touch</h1>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Have questions about our printers, toners, or leasing options? We're here to help.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-3 gap-10">
          {/* Contact Info */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>
            
            {[{
            icon: MapPin,
            title: 'Visit Us',
            lines: ['Pioneer House, 2nd Floor, Tom Mboya Street', 'Opposite Fire Station', 'Nairobi, Kenya']
          }, {
            icon: Phone,
            title: 'Call Us',
            lines: ['+254 721 337781', '+254 722 998406']
          }, {
            icon: Mail,
            title: 'Email Us',
            lines: ['info@prefetchsystems.co.ke', 'sales@prefetchsystems.co.ke']
          }, {
            icon: Clock,
            title: 'Working Hours',
            lines: ['Mon - Fri: 8:00 AM - 6:00 PM', 'Sat: 9:00 AM - 2:00 PM']
          }].map((item, i) => <div key={i} className="flex gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                  {item.lines.map((line, j) => <p key={j} className="text-sm text-gray-500">{line}</p>)}
                </div>
              </div>)}

            {/* Map */}
            <div className="rounded-xl overflow-hidden shadow-sm border border-gray-100 h-[250px]">
              <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3988.8169!2d36.8219!3d-1.2864!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x182f10d0f0000001%3A0x0!2sMoi%20Avenue%2C%20Nairobi!5e0!3m2!1sen!2ske!4v1" width="100%" height="100%" style={{
              border: 0
            }} allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade" title="Prefetch Systems Location" />
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Send Us a Message</h2>
              <p className="text-gray-500 mb-6">Fill out the form below and we'll get back to you within 24 hours.</p>

              {status === 'sent' ? <div className="text-center py-12">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Message Sent!</h3>
                  <p className="text-gray-500 mb-4">Thank you for contacting us. We'll respond shortly.</p>
                  <button onClick={() => setStatus('idle')} className="text-red-600 font-medium hover:text-red-700">
                    Send another message
                  </button>
                </div> : <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                      <input required value={form.name} onChange={e => setForm({
                    ...form,
                    name: e.target.value
                  })} className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                      <input required type="email" value={form.email} onChange={e => setForm({
                    ...form,
                    email: e.target.value
                  })} className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <input value={form.phone} onChange={e => setForm({
                    ...form,
                    phone: e.target.value
                  })} placeholder="0712 345 678" className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                      <select required value={form.subject} onChange={e => setForm({
                    ...form,
                    subject: e.target.value
                  })} className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white">
                        <option value="">Select a subject</option>
                        <option value="Product Inquiry">Product Inquiry</option>
                        <option value="Printer Leasing">Printer Leasing</option>
                        <option value="Technical Support">Technical Support</option>
                        <option value="Bulk Order">Bulk Order</option>
                        <option value="General Inquiry">General Inquiry</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                    <textarea required rows={5} value={form.message} onChange={e => setForm({
                  ...form,
                  message: e.target.value
                })} placeholder="Tell us about your needs..." className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none" />
                  </div>

                  {status === 'error' && <p className="text-red-500 text-sm">Failed to send message. Please try again.</p>}

                  <button type="submit" disabled={status === 'sending'} className="bg-[#1a365d] text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center gap-2">
                    {status === 'sending' ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : <><Send className="w-4 h-4" /> Send Message</>}
                  </button>
                </form>}
            </div>
          </div>
        </div>
      </div>
    </div>;
};
export default ContactPage;