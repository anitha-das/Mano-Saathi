// src/styles/common.js
// Theme inspired by the reference image: calm ivory surfaces, soft sage fields,
// deep green accents, and warm professional shadows.

// Layout
export const pageBackground = "bg-[#F7F8F1] min-h-screen";
export const pageWrapper = "max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16";
export const section = "mb-16";
export const dashboardGrid = "grid grid-cols-1 lg:grid-cols-3 gap-8";

// Cards
export const cardClass =
  "bg-[#FFFDF7] border border-[#DDE7D8] rounded-lg p-7 shadow-[0_14px_32px_rgba(24,76,56,0.09)] hover:-translate-y-1 hover:shadow-[0_22px_45px_rgba(24,76,56,0.14)] transition duration-300";
export const softCard =
  "bg-[#EDF4E8] border border-[#D4E2CE] rounded-lg p-7 shadow-[0_12px_30px_rgba(24,76,56,0.07)]";
export const panelClass =
  "bg-[#FFFDF7] border border-[#DDE7D8] rounded-lg p-7 shadow-[0_16px_38px_rgba(24,76,56,0.10)]";

// Typography
export const pageTitleClass =
  "text-4xl sm:text-6xl font-semibold text-[#123F31] tracking-tight leading-[1.04] [font-family:Georgia,serif]";
export const headingClass =
  "text-2xl sm:text-3xl font-semibold text-[#123F31] tracking-tight leading-snug [font-family:Georgia,serif]";
export const subHeadingClass =
  "text-lg font-bold text-[#214F3F] tracking-tight leading-snug";
export const bodyText = "text-[#33433C] leading-[1.75]";
export const mutedText = "text-sm text-[#65756D]";
export const linkClass =
  "text-[#1F7A58] hover:text-[#123F31] transition-colors font-semibold";
export const tagClass =
  "text-[0.68rem] font-bold text-[#1F7A58] uppercase tracking-[0.18em] w-fit";

// Buttons
export const primaryBtn =
  "bg-[#0E4A37] text-white font-bold px-6 py-3 rounded-lg hover:bg-[#166044] shadow-[0_12px_24px_rgba(14,74,55,0.26)] hover:shadow-[0_16px_30px_rgba(14,74,55,0.32)] hover:-translate-y-0.5 transition duration-300 cursor-pointer text-sm tracking-tight disabled:opacity-60 disabled:cursor-not-allowed";
export const secondaryBtn =
  "border border-[#9CB9A7] text-[#123F31] bg-[#FFFDF7] font-bold px-6 py-3 rounded-lg hover:bg-[#EDF4E8] hover:border-[#1F7A58] shadow-[0_8px_18px_rgba(24,76,56,0.08)] transition duration-300 cursor-pointer text-sm";
export const ghostBtn =
  "text-[#1F7A58] font-bold hover:text-[#123F31] transition-colors cursor-pointer text-sm";
export const dangerBtn =
  "bg-[#B76555] text-white font-bold text-sm px-4 py-2 rounded-lg hover:bg-[#985142] shadow-[0_8px_22px_rgba(183,101,85,0.18)] transition";
export const successBtn =
  "bg-[#0E4A37] text-white font-bold text-sm px-4 py-2 rounded-lg hover:bg-[#166044] shadow-[0_8px_22px_rgba(14,74,55,0.2)] transition";

// Forms
export const formCard =
  "bg-[#FFFDF7] border border-[#DDE7D8] rounded-lg p-6 sm:p-10 max-w-3xl mx-auto shadow-[0_20px_52px_rgba(24,76,56,0.12)]";
export const formTitle =
  "text-2xl sm:text-3xl font-semibold text-[#123F31] tracking-tight text-center mb-8 [font-family:Georgia,serif]";
export const labelClass =
  "text-xs font-bold text-[#214F3F] mb-1.5 block";
export const inputClass =
  "w-full bg-[#FAFBF4] border border-[#C7D7C3] rounded-lg px-4 py-3 text-[#33433C] text-sm placeholder:text-[#7D8A83] focus:outline-none focus:border-[#1F7A58] focus:ring-2 focus:ring-[#1F7A58]/20 transition";
export const formGroup = "mb-5";
export const submitBtn =
  "w-full bg-[#0E4A37] text-white font-bold py-3 rounded-lg hover:bg-[#166044] shadow-[0_12px_24px_rgba(14,74,55,0.26)] transition cursor-pointer mt-2 text-sm tracking-tight disabled:opacity-60";

export const navbarClass =
  "bg-[#F6F8EF]/95 backdrop-blur border-b border-[#D7E4D1] px-4 sm:px-8 min-h-[82px] flex items-center sticky top-0 z-50 shadow-[0_10px_26px_rgba(24,76,56,0.12)]";
export const navContainerClass =
  "max-w-7xl mx-auto w-full flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3";
export const navBrandClass =
  "text-xl sm:text-2xl font-bold text-[#123F31] tracking-tight";
export const navLinksClass =
  "flex flex-wrap items-center gap-x-5 gap-y-3";

export const navLinkClass =
  "text-sm text-[#1E332B] hover:text-[#0E4A37] transition-colors duration-300 font-bold px-1 py-2";

export const navLinkActiveClass =
  "text-sm text-[#0E4A37] font-extrabold border-b-2 border-[#0E4A37] px-1 py-2";
// Lists
export const articleGrid =
  "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8";
export const articleCardClass =
  "bg-[#FFFDF7] border border-[#DDE7D8] rounded-lg p-6 hover:bg-white transition duration-300 flex flex-col gap-3 shadow-[0_12px_30px_rgba(24,76,56,0.08)] hover:-translate-y-1";
export const articleTitle =
  "text-base font-bold text-[#123F31] leading-snug tracking-tight";
export const articleExcerpt =
  "text-sm text-[#33433C] leading-[1.7]";
export const articleMeta =
  "text-xs text-[#65756D]";
export const timestampClass =
  "text-xs text-[#65756D] flex items-center gap-1.5";

// Feedback
export const errorClass =
  "bg-[#F8E8E2] text-[#8A4E43] border border-[#EBCBC0] rounded-lg px-4 py-3 text-sm my-2";
export const successClass =
  "bg-[#EDF4E8] text-[#166044] border border-[#C7D7C3] rounded-lg px-4 py-3 text-sm my-2";
export const loadingClass =
  "text-[#1F7A58]/80 text-sm animate-pulse text-center py-12";
export const emptyStateClass =
  "text-center text-[#65756D] py-14 text-sm";

// Comments / chat
export const commentCard =
  "bg-[#FAFBF4] rounded-lg p-5 border border-[#DDE7D8]";
export const avatar =
  "w-10 h-10 rounded-full bg-[#EDF4E8] text-[#123F31] flex items-center justify-center text-sm font-bold shrink-0";
export const divider = "border-t border-[#DDE7D8] my-10";
export const tabWrap =
  "flex flex-wrap gap-2 mb-8 bg-[#EDF4E8] border border-[#D7E4D1] p-2 rounded-lg w-fit shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]";
export const activeTab =
  "bg-[#FFFDF7] px-4 py-2 rounded-md text-[#0E4A37] text-sm font-extrabold shadow-[0_8px_18px_rgba(24,76,56,0.10)]";
export const idleTab =
  "px-4 py-2 rounded-md text-sm text-[#214F3F] hover:text-[#0E4A37] hover:bg-[#FFFDF7]/80 transition font-bold";
