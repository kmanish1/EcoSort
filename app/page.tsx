"use client";

import React, { useState, useEffect } from "react";
import classNames from "classnames";

// Define item type
interface Item {
  id: number;
  name: string;
  emoji: string;
  type: "recycling" | "compost" | "trash";
}

// Define bin state type
interface Bins {
  recycling: Item[];
  compost: Item[];
  trash: Item[];
}

export default function EcoSortCaptcha() {
  const [bins, setBins] = useState<Bins>({
    recycling: [],
    compost: [],
    trash: [],
  });

  const [binErrors, setBinErrors] = useState({
    recycling: false,
    compost: false,
    trash: false,
  });

  const [challengeCompleted, setChallengeCompleted] = useState(false);
  const [challengeFailed, setChallengeFailed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120); // Challenge expires in 2 minutes
  const [draggingItem, setDraggingItem] = useState<Item | null>(null);

  // Updated items for environmental awareness
  const items: Item[] = [
    { id: 1, name: "Plastic Bottle", emoji: "🥤", type: "recycling" },
    { id: 2, name: "Apple Core", emoji: "🍎", type: "compost" },
    { id: 3, name: "Newspaper", emoji: "📰", type: "recycling" },
    { id: 4, name: "Candy Wrapper", emoji: "🍬", type: "trash" },
  ];

  const handleDrop = (bin: keyof Bins, itemId: number): void => {
    const item = items.find((i) => i.id === itemId);

    if (item) {
      if (item.type === bin) {
        // Correct placement
        setBins((prev) => ({
          ...prev,
          [bin]: [...prev[bin], item],
        }));
        setBinErrors((prev) => ({
          ...prev,
          [bin]: false,
        }));

        // Check if all items are sorted correctly
        const allItemsSorted =
          [...bins.recycling, ...(bin === "recycling" ? [item] : [])].length ===
            items.filter((i) => i.type === "recycling").length &&
          [...bins.compost, ...(bin === "compost" ? [item] : [])].length ===
            items.filter((i) => i.type === "compost").length &&
          [...bins.trash, ...(bin === "trash" ? [item] : [])].length ===
            items.filter((i) => i.type === "trash").length;

        if (allItemsSorted) {
          setChallengeCompleted(true);
          setTimeLeft(0); // Stop timer
        }
      } else {
        // Incorrect placement
        setBinErrors((prev) => ({
          ...prev,
          [bin]: true,
        }));
        setChallengeFailed(true);
        setTimeLeft(0); // Stop timer
      }
    }
  };

  useEffect(() => {
    // Countdown timer for CAPTCHA expiration
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (!challengeCompleted) {
            setChallengeFailed(true);
          }
          return 0; // Prevent going negative
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [challengeCompleted]);

  return (
    <div className="bg-gradient-to-b from-gray-900 to-gray-800 min-h-screen flex flex-col items-center justify-center p-6 text-white">
      <h1 className="text-5xl font-bold mb-8 text-center">
        🌍 EcoSort CAPTCHA
      </h1>

      {/* Timer */}
      <div className="mb-6">
        <p className="text-xl font-semibold">Time Left: {timeLeft}s</p>
      </div>

      {/* Display items */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        {items.map((item) => (
          <div
            key={item.id}
            className="p-6 bg-gray-800 rounded-lg shadow-lg hover:scale-105 transition-all cursor-pointer"
            draggable
            onDragStart={(e) => {
              setDraggingItem(item);
              e.dataTransfer.setData("itemId", item.id.toString());
            }}
            onDragEnd={() => setDraggingItem(null)}
          >
            <span className="text-4xl">{item.emoji}</span>
            <p className="text-center text-sm mt-4">{item.name}</p>
          </div>
        ))}
      </div>

      {/* Bins */}
      <div className="grid grid-cols-3 gap-8">
        {(["recycling", "compost", "trash"] as Array<keyof Bins>).map((bin) => (
          <div
            key={bin}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) =>
              handleDrop(bin, parseInt(e.dataTransfer.getData("itemId")))
            }
            className={classNames(
              "p-8 rounded-lg shadow-lg text-center transition-all",
              {
                "bg-green-600": challengeCompleted && !binErrors[bin], // Only when all items are correct
                "bg-red-600": binErrors[bin], // Incorrect bin
                "bg-gray-700": !binErrors[bin] && !challengeCompleted, // Default state
              }
            )}
          >
            <h2 className="text-xl font-semibold capitalize mb-6">{bin}</h2>
            <div className="min-h-[50px] flex flex-wrap gap-2 justify-center">
              {bins[bin].map((item) => (
                <span key={item.id} className="text-3xl">
                  {item.emoji}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Notifications */}
      <div className="mt-8 text-lg">
        {challengeCompleted && (
          <div className="p-4 bg-green-500 rounded-lg shadow-lg">
            🎉 Congratulations! You’ve sorted all items correctly.
          </div>
        )}
        {challengeFailed && (
          <div className="p-4 bg-red-500 rounded-lg shadow-lg">
            ❌ CAPTCHA failed. Please try again.
          </div>
        )}
        {!challengeCompleted && !challengeFailed && timeLeft === 0 && (
          <div className="p-4 bg-yellow-500 rounded-lg shadow-lg">
            ⏰ Time’s up! CAPTCHA expired.
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-8 p-4 bg-gray-700 rounded-lg shadow-md text-center text-lg">
        <p>
          Drag items like 🥤, 🍎, 📰, and 🍬 into their correct bins:
          <ul className="mt-4 list-inside text-sm text-gray-300">
            <li>
              <b>Recycling:</b> Plastic bottles, newspapers.
            </li>
            <li>
              <b>Compost:</b> Organic waste like apple cores.
            </li>
            <li>
              <b>Trash:</b> Non-recyclable items like candy wrappers.
            </li>
          </ul>
        </p>
      </div>
    </div>
  );
}
