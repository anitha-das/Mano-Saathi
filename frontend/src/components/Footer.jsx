import { mutedText } from "../styles/common";

function Footer() {
  return (
    <footer className="border-t border-[#DDE7D8] bg-[#FFFDF7]/92 py-9">
      <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row gap-3 justify-between">
        <p className={mutedText}>MANO-SAATHI - Emotional wellness support for students.</p>
        <p className={mutedText}>No student should feel emotionally alone.</p>
      </div>
    </footer>
  );
}

export default Footer;

