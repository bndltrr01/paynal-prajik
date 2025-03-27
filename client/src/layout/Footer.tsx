import { footerSections } from "../constants/Footer";
import hotel_logo from "../assets/hotel_logo.png";

const Footer = () => {
  return (
    <footer className="relative bg-gray-100 px-6 md:px-15 py-5 font-montserrat">
      <img loading="lazy" src={hotel_logo} className="h-10 w-auto cursor-pointer mb-3" />
      <div className="px-5">
        <i className="fa-solid fa-location-dot text-violet-600"></i>
        <h6 className="inline-block ml-1 text-sm italic mb-5">
          Brgy. Bubukal Sta. Cruz, Laguna
        </h6>

        {/* Footer Sections with min 2 columns */}
        <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 py-2">
          {footerSections.map((section, index) => (
            <div key={index}>
              <h1 className="text-base font-semibold">{section.title}</h1>
              <ul className="pt-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex} className="text-sm pt-2">
                    <a
                      href="#"
                      className="text-blue-600 hover:underline transition-all duration-300"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        {/* Bottom Section */}
        <section className="flex flex-col md:flex-row justify-between items-center py-5 border-t-2 border-gray-200 mt-7 gap-3">
          <h1 className="text-xs text-center md:text-left">
            <span className="border-r-2 border-gray-500 pr-2 mr-2">
              Privacy Policy
            </span>
            &copy; Copyright {new Date().getFullYear()} Azurea. All rights
            reserved.
          </h1>
          <div className="flex gap-5">
            <i className="fa-brands fa-instagram text-xl transition-all duration-300 border border-gray-800 p-2 rounded-full hover:bg-black hover:text-white"></i>
            <i className="fa-brands fa-facebook-f text-xl transition-all duration-300 border border-black p-2 px-3 rounded-full hover:text-white hover:bg-blue-500"></i>
            <i className="fa-brands fa-x-twitter text-xl transition-all duration-300 border border-black p-2 rounded-full hover:text-white hover:bg-black"></i>
            <i className="fa-brands fa-tiktok text-xl transition-all duration-300 border border-black p-2 rounded-full hover:text-white hover:bg-black"></i>
            <i className="fa-brands fa-linkedin-in text-xl transition-all duration-300 border border-black p-2 rounded-full hover:bg-[#0077b5] hover:text-white"></i>
          </div>
        </section>
      </div>
    </footer>
  );
};

export default Footer;
