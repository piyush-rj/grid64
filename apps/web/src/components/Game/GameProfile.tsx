'use client'
import { useUserSessionStore } from "@/src/store/useUserSessionStore";
import { useEffect, useRef, useState } from "react";
import { Roboto } from 'next/font/google';
import { cn } from "@/src/lib/utils";
import Image from "next/image";
import { LogOutIcon } from "lucide-react";
import LogoutModal from "../utility/LogoutModal";

const roboto = Roboto({
    subsets: ["latin"],
    weight: ["300", "400", "500", "700"],
});

export default function GameFooterProfile() {

    const [currentImage, setCurrentImage] = useState<number>(0);
    const [isPressed, setIsPressed] = useState<boolean>(false);
    const { session } = useUserSessionStore();
    const [panel, setPanel] = useState<boolean>(false);
    const [showLogoutModal, setShowLogoutModal] = useState<boolean>(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (!panelRef.current) return;
        if (panel) {
            gsap.fromTo(
                panelRef.current,
                { opacity: 0, y: -10, scale: 0.95 },
                { opacity: 1, y: 0, scale: 1, duration: 0.3, ease: "back.out(1.7)" }
            );
        }
    }, [panel]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setPanel(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);


    if (!session) return;
    const allImages = [session.user?.image, '/images/dazai.jpeg', '/images/Gojo.jpeg', '/images/tanjiro.jpeg'];

    function handleClick() {
        setIsPressed(true);
        console.log("session image is", session?.user?.image);

        setTimeout(() => {
            setIsPressed(false);
            setCurrentImage((prev) => (prev + 1) % allImages.length);
        }, 100);
    };

    function handleLogoutClick() {
        setPanel(false);
        setShowLogoutModal(true);
    }


    return (
        <div className="px-3 py-2 flex rounded-xl items-center gap-x-4">
            <span className={cn(
                'rounded-md flex justify-center items-center hover:bg-neutral-900 transition-colors transform duration-200 cursor-pointer',
                roboto.className,
                'tracking-wider font-light'
            )}>
                {session?.user?.name}
            </span>
            <span
                onClick={handleClick}
                className={`h-8 w-8 rounded-md overflow-hidden relative cursor-pointer 
                      transition-transform duration-150 ${isPressed ? 'scale-90' : 'scale-100'}`}
            >
                <Image
                    src={`${allImages[currentImage]}`}
                    alt="you"
                    fill
                    className="object-cover"
                />
            </span>
            <div ref={containerRef} className="flex justify-center items-center gap-x-2">

                <div
                    onClick={handleLogoutClick}
                    className={cn(
                        'p-2 size-9 flex justify-center items-center rounded-xl',
                        'border border-neutral-700',
                        'text-[#7F7FAF] hover:bg-[#53160e] hover:border hover:border-[#521c15] hover:text-[#bdbdbd] transition-all duration-300 cursor-pointer'
                    )}
                >
                    <LogOutIcon />
                </div>

            </div>
            {showLogoutModal && (
                <LogoutModal
                    opeLogoutModal={showLogoutModal}
                    setOpeLogoutModal={setShowLogoutModal}
                />
            )}
        </div>
    )
}