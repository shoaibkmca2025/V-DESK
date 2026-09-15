import { showTestimonial } from '@/features/testimonials/testimonials.js';

/** SECTION 09 &mdash; TESTIMONIALS / SOCIAL PROOF Verified Accounts from Serious Indian Founders & Enterprises */
export default function TestimonialsSection() {
  return (
    <section className="section testimonials" id="testimonials">
      <div className="container">
        <div className="section__header section__header--center reveal">
          <span className="section__eyebrow">Verified Experiences</span>
          <h2 className="section__title">
            TRUSTED BY FOUNDERS,
            <br />
            CAs & ENTERPRISES.
          </h2>
          <p className="section__desc">Real stories from businesses operating across our commercial network.</p>
        </div>
        <div className="testimonial-display reveal" id="testimonialDisplay">
          <div className="testimonial-stars" aria-label="5 out of 5 stars rating">
            <i className="ph-bold ph-star" />
            <i className="ph-bold ph-star" />
            <i className="ph-bold ph-star" />
            <i className="ph-bold ph-star" />
            <i className="ph-bold ph-star" />
          </div>
          <p className="testimonial-display__quote" id="testiQuote">
            Getting our GST registration in Maharashtra was seamless with V-DESK. The registered rent agreement and
            electricity bill were delivered in less than 24 hours. Their team even assisted when the tax officer
            conducted a physical verification.
          </p>
          <div className="testimonial-display__author">
            <strong className="testimonial-display__name" id="testiName">
              Priya Kulkarni
            </strong>
            <span className="testimonial-display__role" id="testiRole">
              Founder & Director, Zenith D2C Brands
            </span>
            <span className="testimonial-display__location" id="testiLocation">
              Nashik & Mumbai Hub
            </span>
          </div>
          <div className="testimonial-dots" id="testiDots">
            <button className="testimonial-dot active" onClick={() => showTestimonial(0)} aria-label="Testimonial 1" />
            <button className="testimonial-dot" onClick={() => showTestimonial(1)} aria-label="Testimonial 2" />
            <button className="testimonial-dot" onClick={() => showTestimonial(2)} aria-label="Testimonial 3" />
          </div>
        </div>
      </div>
    </section>
  );
}
