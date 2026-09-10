import React from "react";

/**
 * Exact icon set from the Savee desktop rail
 * (packages/shared-client/img/icon-rail-*-inlined.svg + logo-inlined.svg
 * in saveeit/savee). Standardized 24px-viewBox, 2px-stroke, currentColor.
 */

type IconProps = { className?: string };

export const SaveeLogo = ({ className }: IconProps) => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M11.0165 4.01297C10.7983 4.00432 10.576 4 10.3496 4C7.72077 4 5.62843 4.65964 4.07248 5.97895C2.51651 7.29825 1.73855 9.02455 1.73855 11.1579C1.73855 12.9684 2.56269 14.386 4.21102 15.4105C5.13464 16 6.56979 16.5333 8.51651 17.0105L11.0165 17.6322V13.8508L9.62487 13.5158C8.51651 13.2491 7.67815 12.9403 7.10978 12.5895C6.12931 12 5.63908 11.214 5.63908 10.2316C5.63908 9.33333 6.01207 8.61053 6.75808 8.06316C7.50409 7.51579 8.60177 7.2421 10.0512 7.2421C10.3885 7.2421 10.7103 7.2541 11.0165 7.27809V4.01297ZM11.0165 27.9953V24.797C10.9368 24.799 10.8566 24.8 10.7758 24.8C8.38862 24.8 6.71191 24.1894 5.74565 22.9684C5.2199 22.2947 4.90018 21.3263 4.78651 20.0631H1.09912C1.19859 22.3088 1.95524 24.1929 3.3691 25.7158C4.78296 27.2386 7.18791 28 10.584 28C10.7299 28 10.874 27.9984 11.0165 27.9953Z"
      fill="currentColor"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M15.7018 20.0631C15.8155 21.3263 16.135 22.2947 16.6606 22.9684C17.6264 24.1894 19.3023 24.8 21.6885 24.8C23.1088 24.8 24.3587 24.4947 25.4381 23.8842C26.5176 23.2737 27.0573 22.3298 27.0573 21.0526C27.0573 20.0841 26.6241 19.3474 25.7578 18.8421C25.2038 18.5334 24.1101 18.1754 22.4768 17.7685L19.4302 17.0105C17.4843 16.5333 16.0498 16 15.1266 15.4105C13.479 14.386 12.6553 12.9684 12.6553 11.1579C12.6553 9.02455 13.4329 7.29825 14.9881 5.97895C16.5434 4.65964 18.6348 4 21.2624 4C24.6996 4 27.1781 4.99648 28.6977 6.98948C29.6494 8.25263 30.111 9.61403 30.0826 11.0737H26.4607C26.3898 10.2175 26.0844 9.43859 25.5446 8.73685C24.664 7.74034 23.1372 7.2421 20.9641 7.2421C19.5154 7.2421 18.4182 7.51579 17.6725 8.06316C16.9269 8.61053 16.554 9.33333 16.554 10.2316C16.554 11.214 17.044 12 18.0241 12.5895C18.5922 12.9403 19.4302 13.2491 20.538 13.5158L23.0733 14.1263C25.8287 14.786 27.6751 15.4246 28.6125 16.0421C30.1039 17.0106 30.8495 18.5334 30.8495 20.6105C30.8495 22.6175 30.0791 24.3508 28.538 25.8105C26.9969 27.2701 24.6499 28 21.4967 28C18.1022 28 15.6983 27.2386 14.2851 25.7158C12.8718 24.1929 12.1155 22.3088 12.0161 20.0631H15.7018Z"
      fill="currentColor"
    />
  </svg>
);

export const IconRailSearch = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="10.75" cy="10.75" r="7.25" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16.1 16.1L21.5 21.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const IconRailAdd = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M12 4.25V19.75" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M4.25 12H19.75" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const IconRailHeart = ({ className }: IconProps) => (
  <svg viewBox="10 10 24 24" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12.9038 13.9038C14.1228 12.6848 15.7761 12 17.5 12C18.4802 12 19.3732 12.1402 20.2468 12.5207C20.8597 12.7876 21.4321 13.1594 22 13.6393C22.5679 13.1594 23.1403 12.7876 23.7532 12.5207C24.6268 12.1402 25.5198 12 26.5 12C28.2239 12 29.8772 12.6848 31.0962 13.9038C32.3152 15.1228 33 16.7761 33 18.5C33 21.2418 31.1906 23.2531 29.7035 24.7107L22.7071 31.7071C22.3166 32.0976 21.6834 32.0976 21.2929 31.7071L14.2988 24.7131C12.7944 23.258 11 21.2494 11 18.5C11 16.7761 11.6848 15.1228 12.9038 13.9038ZM17.5 14C16.3065 14 15.1619 14.4741 14.318 15.318C13.4741 16.1619 13 17.3065 13 18.5C13 20.3469 14.2007 21.8365 15.695 23.281L15.7071 23.2929L22 29.5858L28.3001 23.2857C29.7923 21.8235 31 20.3359 31 18.5C31 17.3065 30.5259 16.1619 29.682 15.318C28.8381 14.4741 27.6935 14 26.5 14C25.7202 14 25.1132 14.1098 24.5518 14.3543C23.984 14.6016 23.4001 15.0141 22.7071 15.7071C22.3166 16.0976 21.6834 16.0976 21.2929 15.7071C20.5999 15.0141 20.016 14.6016 19.4482 14.3543C18.8868 14.1098 18.2798 14 17.5 14Z"
      fill="currentColor"
    />
  </svg>
);

export const IconRailBoards = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="3.75" y="3.75" width="7" height="7" rx="1.75" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    <rect x="13.25" y="3.75" width="7" height="7" rx="1.75" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    <rect x="3.75" y="13.25" width="7" height="7" rx="1.75" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
    <rect x="13.25" y="13.25" width="7" height="7" rx="1.75" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
  </svg>
);

export const IconRailSelect = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path
      d="M4.037 4.688a.495.495 0 0 1 .651-.651l16 6.5a.5.5 0 0 1-.063.947l-6.124 1.58a2 2 0 0 0-1.438 1.435l-1.579 6.126a.5.5 0 0 1-.947.063z"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const IconRailGrid = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={className}>
    <circle cx="12" cy="12" r="3.25" fill="none" stroke="currentColor" strokeWidth="2" />
    <path d="M2.75 12H6.75" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M17.25 12H21.25" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const IconRailMenu = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M3.5 8.25H20.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M3.5 15.75H20.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);
