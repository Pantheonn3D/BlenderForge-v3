import React from 'react';
import { Link } from 'react-router-dom';
import styles from './TermsAndConditionsPage.module.css';

const TermsAndConditionsPage = () => {
  return (
    <div className={styles.container}>
      <h1>Terms and Conditions for BlenderForge</h1>
      <p><strong>Last updated: August 13, 2025</strong></p>

      <h2>1. Agreement to Terms</h2>
      <p>By accessing or using our website, blenderforge.com (the "Site"), and the services provided therein, you agree to be bound by these Terms and Conditions ("Terms"). If you disagree with any part of the terms, then you may not access the service. Your access to and use of the Service is conditioned on your acceptance of and compliance with our <Link to="/privacy-policy">Privacy Policy</Link>.</p>

      <h2>2. User Accounts</h2>
      <p>To access certain features of the Site, such as uploading content, you must register for an account. When you create an account with us, you must provide us with information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.</p>
      <p>We use third-party services like Google for authentication. By creating an account, you agree that we may store information associated with your account, such as your email address, full name as provided by the authentication service, and a unique user ID. This information is stored for the purpose of identifying you, managing your content, and for potential legal intervention if required. You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password.</p>

      <h2>3. User-Generated Content</h2>
      <p>Our Service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material ("Content"). You are solely responsible for the Content that you post on or through the Service, including its legality, reliability, and appropriateness.</p>
      <p>By posting Content on or through the Service, you represent and warrant that: (i) the Content is yours (you own it) and/or you have the right to use it and the right to grant us the rights and license as provided in these Terms, and (ii) the posting of your Content on or through the Service does not violate the privacy rights, publicity rights, copyrights, contract rights or any other rights of any person or entity.</p>
      <p><strong>You retain any and all of your rights to any Content you submit. However, by submitting Content, you grant BlenderForge a worldwide, non-exclusive, royalty-free, sublicensable, and transferable license to use, reproduce, distribute, prepare derivative works of, display, and perform the Content in connection with the Service and BlenderForge's business.</strong></p>
      <p>BlenderForge has the right but not the obligation to monitor and edit all Content provided by users. We reserve the right to remove any content that violates these terms or is otherwise deemed objectionable, at our sole discretion.</p>

      <h2>4. Marketplace Terms</h2>
      <p>The Site includes a marketplace that allows users to sell and purchase digital products. BlenderForge acts as a facilitator to connect buyers and sellers. We are not a party to any transaction between users.</p>
      <p><strong>For Sellers:</strong> You are responsible for the products you upload, including ensuring they are functional, free from malicious code, and accurately described. You must have all necessary rights to sell the products you list.</p>
      
      {/* --- THIS IS THE NEW PARAGRAPH --- */}
      <p>
        <strong>Platform Fee:</strong> To sustain the platform, including covering operational costs, payment processing, content hosting, and continued platform development, you agree that <strong>BlenderForge will retain a 10% fee from the total price of each transaction.</strong> This fee is automatically deducted at the time of purchase. The remaining 90% of the transaction price will constitute the seller's final revenue for that sale.
      </p>
      {/* --- END OF NEW PARAGRAPH --- */}
      
      <p><strong>For Buyers:</strong> You are responsible for reading the product description before making a purchase. While we encourage sellers to provide support, we do not guarantee it. All transactions are final unless otherwise specified by the seller or required by law.</p>
      
      <h2>5. Prohibited Conduct</h2>
      <p>You agree not to use the Service to: upload content that is illegal, defamatory, or infringes on any third-party rights; harass, abuse, or harm another person; upload any material that contains software viruses or any other computer code, files or programs designed to interrupt, destroy or limit the functionality of any computer software or hardware; or engage in any other conduct that restricts or inhibits any other person from using or enjoying the Service.</p>
      
      <h2>6. Intellectual Property</h2>
      <p>The Service and its original content (excluding Content provided by users), features, and functionality are and will remain the exclusive property of BlenderForge and its licensors. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of BlenderForge.</p>

      <h2>7. Termination</h2>
      <p>We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever and without limitation, including but not to a breach of the Terms.</p>
      
      <h2>8. Limitation Of Liability</h2>
      <p>In no event shall BlenderForge, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service. The products and content on our site are provided "as is" without warranty of any kind.</p>
      
      <h2>9. Changes To Terms</h2>
      <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will provide at least 30 days' notice prior to any new terms taking effect. By continuing to access or use our Service after any revisions become effective, you agree to be bound by the revised terms.</p>

      <h2>10. Contact Us</h2>
      <p>If you have any questions about these Terms, please <Link to="/contact">contact us</Link>.</p>
    </div>
  );
};

export default TermsAndConditionsPage;