"use client";

import { cn } from "@/src/lib/utils";
import { useUserSessionStore } from "@/src/store/useUserSessionStore";
import { Schoolbell } from 'next/font/google'


const schoolBell = Schoolbell({
    subsets: ['latin'],
    weight: ['400']
})

export default function NameCard() {
    const { session } = useUserSessionStore();

    if (!session) {
        return (
            <div>
                Error: session not found
            </div>
        );
    }

    return (
        <div
            className={cn(
                schoolBell.className,
                "flex justify-center items-center text-[17px] md:text-[23px] text-[#e7e7e7] font-light tracking-"
            )}
        >
            hey, king
            {/* <span className="text-[#c5c5c5]">
        {session.user?.name?.split(" ")[0]}
      </span> */}
        </div>
    );
}
