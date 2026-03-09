"use client";

import React from "react";


function Footer() {

    return (
        <footer className="bg-[#3f466a] text-white pt-1 pb-2 border-t border-gray-700/30">
            <div className="container mx-auto px-4 max-w-7xl">

                {/* Bottom Bar */}
                <div className="pt-1 border-t border-gray-600/50 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-400">
                    <p className="text-center md:text-left">
                        © 2025 Ibra Consulting s.r.l. Tutti i diritti riservati.
                    </p>
                    <ul className="flex flex-wrap justify-center md:justify-end gap-6">
                        <li>
                            <a className="hover:text-white transition-colors" href="/">
                                Privacy Policy
                            </a>
                        </li>
                        <li>
                            <a className="hover:text-white transition-colors" href="/">
                                Termini di Utilizzo
                            </a>
                        </li>
                        <li>
                            <a className="hover:text-white transition-colors" href="/">
                                Cookie Policy
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </footer >
    );
}

export default Footer;
