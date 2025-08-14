import React from 'react';
import { Link } from 'react-router-dom';
import styles from './TermsAndConditionsPage.module.css';

const TermsAndConditionsPage = () => {
  return (
    <div className={styles.container}>
      <h1>Terms and Conditions for BlenderForge</h1>
      <p><strong>Last updated: August 13, 2025</strong></p>

      <h2>1. Agreement to Terms</h2>
      <p>By accessing or using our website, blenderforge.com (the "Site"), and the services provided, you agree to be bound by these Terms and Conditions ("Terms"). If you disagree with any part of the terms, you may not access the Service. Your use of the Service is also governed by our <Link to="/privacy-policy">Privacy Policy</Link>.</p>

      <h2>2. User Accounts</h2>
      <p>To use features like uploading content, leaving reviews, or making purchases, you must register for an account. We use third-party services like Google for authentication. You agree that the information you provide is accurate and current. You are responsible for all activities under your account.</p>

      <h2>3. User-Generated Content (UGC)</h2>
      <p>Our Service allows you to post, link, and upload content, including articles, products, comments, and reviews ("Content"). You are solely responsible for the Content you submit.</p>
      <p>You retain all ownership rights to your Content. However, by submitting Content to the Site, you grant BlenderForge a worldwide, non-exclusive, royalty-free, sublicensable, and transferable license to use, reproduce, distribute, display, and perform the Content in connection with the Service and our promotional activities.</p>
      <p>You agree not to submit Content that is illegal, defamatory, infringes on intellectual property rights, contains malicious code, or is otherwise objectionable. All submitted articles and products are subject to a moderation review before being made public. We reserve the right to approve, reject, or remove any Content at our sole discretion without notice if it violates these Terms or our content guidelines.</p>

      <h2>4. Marketplace Terms</h2>
      <p>The Site includes a marketplace allowing users to sell and purchase digital products ("Products"). BlenderForge acts as the platform provider.</p>
      
      <h3>For Sellers:</h3>
      <ul>
        <li>You must connect a valid Stripe account via Stripe Connect to receive payments for your Products. You are responsible for any fees associated with your Stripe account.</li>
        <li>You are responsible for the Products you upload, ensuring they are accurately described, functional, and that you hold all necessary rights to sell them.</li>
        <li><strong>Platform Fee:</strong> To sustain the platform, you agree that BlenderForge will retain a 10% fee from the total sale price of each transaction. This fee is automatically deducted via Stripe Connect. The remaining 90% constitutes your revenue for the sale.</li>
        <li>You are responsible for providing reasonable support to buyers of your Products and for accurately stating your support policy.</li>
      </ul>

      <h3>For Buyers:</h3>
      <ul>
        <li>You are granted a license to use purchased Products for personal, commercial, and educational purposes. You may not redistribute or resell the Products themselves.</li>
        <li>All payments are processed securely through Stripe. We do not store your credit card information.</li>
        <li>Due to the digital nature of the products, all sales are considered final. Refunds are handled on a case-by-case basis at the discretion of the seller and BlenderForge.</li>
      </ul>

      <h2>5. Prohibited Conduct</h2>
      <p>You agree not to engage in any activity that could harm the Service or its users. This includes, but is not limited to: attempting to circumvent payment systems, harassing other users, uploading malicious software, or engaging in any form of data scraping without permission.</p>
      
      <h2>6. Intellectual Property</h2>
      <p>The Service and its original content (excluding UGC), features, and functionality are the exclusive property of BlenderForge. Our branding may not be used without our prior written consent.</p>

      <h2>7. Termination</h2>
      <p>We may terminate or suspend your account immediately, without prior notice, for any reason, including a breach of these Terms. Upon termination, your right to use the Service will cease, and we may remove your Content from the platform.</p>
      
      <h2>8. Limitation of Liability & Disclaimer of Warranties</h2>
      <p>The Service and all content are provided "as is" without warranty of any kind. BlenderForge shall not be liable for any indirect, incidental, special, or consequential damages resulting from your use of the Service or the purchase of any Product from our marketplace.</p>
      
      <h2>9. Changes to Terms</h2>
      <p>We reserve the right to modify these Terms at any time. We will notify users of significant changes. By continuing to use the Service after revisions become effective, you agree to be bound by the revised terms.</p>

      <h2>10. Contact Us</h2>
      <p>If you have any questions about these Terms, please <Link to="/contact">contact us</Link>.</p>
    </div>
  );
};

export default TermsAndConditionsPage;