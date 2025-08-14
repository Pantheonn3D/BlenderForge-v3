import React from 'react';
import { Link } from 'react-router-dom';
import styles from './PrivacyPolicyPage.module.css';

const PrivacyPolicyPage = () => {
  return (
    <div className={styles.container}>
      <h1>Privacy Policy for BlenderForge</h1>
      <p><strong>Last updated: August 13, 2025</strong></p>

      <p>This Privacy Policy describes Our policies and procedures on the collection, use and disclosure of Your information when You use the Service and tells You about Your privacy rights and how the law protects You. We use Your Personal data to provide and improve the Service. By using the Service, You agree to the collection and use of information in accordance with this Privacy Policy.</p>

      <h2>1. Information We Collect</h2>
      
      <h3>Information You Provide to Us</h3>
      <ul>
        <li><strong>Account Information:</strong> When you create an account using our third-party authentication provider (Google), we receive your name, email address, and a unique user ID. We store this information to manage your account and content.</li>
        <li><strong>Profile Information:</strong> You may voluntarily add information to your public profile, such as a username, biography, avatar, and banner image.</li>
        <li><strong>Content Information:</strong> We collect the content you create, including articles, products, comments, reviews, and images you upload.</li>
        <li><strong>Transaction Information:</strong> When you purchase or sell a product, our payment processor, Stripe, manages the transaction. We receive a confirmation of the transaction, but we do not collect or store your full credit card information. Sellers are required to connect a Stripe account, and their Stripe account ID is stored to facilitate payouts.</li>
      </ul>

      <h3>Information We Collect Automatically</h3>
      <ul>
        <li><strong>Log and Usage Data:</strong> Like most websites, we collect information that your browser sends, such as your IP address, browser type, pages visited, and the time and date of your visit.</li>
        <li><strong>Cookies:</strong> We use cookies to operate and administer our Site and to improve your experience. A cookie is a piece of information sent to your browser from a website.</li>
      </ul>

      <h2>2. How We Use Your Information</h2>
      <ul>
        <li>To provide, operate, and maintain our Service.</li>
        <li>To manage your account and your user-generated content.</li>
        <li>To process transactions and facilitate payouts to sellers.</li>
        <li>To communicate with you, including for customer support.</li>
        <li>To display your public profile and content to other users.</li>
        <li>To analyze usage and improve our Service.</li>
        <li>To comply with legal obligations.</li>
      </ul>
      
      <h2>3. Third-Party Services</h2>
      <p>We rely on third-party services to operate our platform:</p>
      <ul>
        <li><strong>Supabase:</strong> Our backend provider for database, authentication, and storage. All your data is securely stored with Supabase.</li>
        <li><strong>Google Authentication:</strong> Used for creating and logging into your account.</li>
        <li><strong>Stripe:</strong> Our exclusive payment processor for marketplace transactions and payouts. We do not process or store payment card details directly.</li>
        <li><strong>Google AdSense:</strong> We use Google AdSense to display ads on our site. Google uses cookies to serve ads based on a user's prior visits. You may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">Ads Settings</a>.</li>
      </ul>

      <h2>4. Data Retention and Deletion</h2>
      <p>We retain your personal data as long as you have an account with us. You can request the deletion of your account and associated personal data by contacting us. Please note that some information, such as transaction records, may be retained for a longer period to comply with our legal and financial obligations.</p>

      <h2>5. Your Rights</h2>
      <p>You have the right to access, update, or delete the information we have on you. You can update your profile information at any time through your "Edit Profile" page. For other requests, please <Link to="/contact">contact us</Link>.</p>

      <h2>6. Changes to This Privacy Policy</h2>
      <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date.</p>

      <h2>7. Contact Us</h2>
      <p>If you have any questions about this Privacy Policy, you can contact us via email at: blenderforge.contact@gmail.com</p>
    </div>
  );
};

export default PrivacyPolicyPage;