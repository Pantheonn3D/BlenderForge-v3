import React from 'react';
import styles from './PrivacyPolicyPage.module.css';

const PrivacyPolicyPage = () => {
  return (
    <div className={styles.container}>
      <h1>Privacy Policy for BlenderForge</h1>

      <p><strong>Last updated: August 13, 2025</strong></p>

      <p>
        At BlenderForge, accessible from blenderforge.com, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by BlenderForge and how we use it.
      </p>

      <p>
        If you have additional questions or require more information about our Privacy Policy, do not hesitate to contact us.
      </p>

      <h2>Log Files</h2>
      <p>
        BlenderForge follows a standard procedure of using log files. These files log visitors when they visit websites. All hosting companies do this and a part of hosting services' analytics. The information collected by log files include internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks. These are not linked to any information that is personally identifiable. The purpose of the information is for analyzing trends, administering the site, tracking users' movement on the website, and gathering demographic information.
      </p>

      <h2>Cookies and Web Beacons</h2>
      <p>
        Like any other website, BlenderForge uses 'cookies'. These cookies are used to store information including visitors' preferences, and the pages on the website that the visitor accessed or visited. The information is used to optimize the users' experience by customizing our web page content based on visitors' browser type and/or other information.
      </p>
      
      <h2 className={styles.adsenseSection}>Google DoubleClick DART Cookie</h2>
      <p>
        Google is one of a third-party vendor on our site. It also uses cookies, known as DART cookies, to serve ads to our site visitors based upon their visit to our site and other sites on the internet. However, visitors may choose to decline the use of DART cookies by visiting the Google ad and content network Privacy Policy at the following URL – <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer">https://policies.google.com/technologies/ads</a>
      </p>

      <h2>Our Advertising Partners</h2>
      <p>
        Some of advertisers on our site may use cookies and web beacons. Our advertising partners are listed below. Each of our advertising partners has their own Privacy Policy for their policies on user data. For easier access, we hyperlinked to their Privacy Policies below.
      </p>
      <ul>
        <li>
          <strong>Google</strong><br />
          <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer">https://policies.google.com/technologies/ads</a>
        </li>
      </ul>

      <h2>Third Party Privacy Policies</h2>
      <p>
        BlenderForge's Privacy Policy does not apply to other advertisers or websites. Thus, we are advising you to consult the respective Privacy Policies of these third-party ad servers for more detailed information. It may include their practices and instructions about how to opt-out of certain options.
      </p>
      <p>
        You can choose to disable cookies through your individual browser options. To know more detailed information about cookie management with specific web browsers, it can be found at the browsers' respective websites.
      </p>

      <h2>Consent</h2>
      <p>
        By using our website, you hereby consent to our Privacy Policy and agree to its terms.
      </p>
    </div>
  );
};

export default PrivacyPolicyPage;