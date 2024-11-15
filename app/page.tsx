"use client";

import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "./components/ui/alert";

interface Item {
  id: number;
  name: string;
  emoji: string;
  type: "recycling" | "compost" | "trash";
}

interface Bins {
  recycling: Item[];
  compost: Item[];
  trash: Item[];
}

interface BinErrors {
  recycling: boolean;
  compost: boolean;
  trash: boolean;
}

const EcoSortCaptchaPremium: React.FC = () => {
  const [bins, setBins] = useState<Bins>({
    recycling: [],
    compost: [],
    trash: [],
  });

  const [binErrors, setBinErrors] = useState<BinErrors>({
    recycling: false,
    compost: false,
    trash: false,
  });

  const [availableItems, setAvailableItems] = useState<Item[]>([
    { id: 1, name: "Plastic Bottle", emoji: "🥤", type: "recycling" },
    { id: 2, name: "Apple Core", emoji: "🍎", type: "compost" },
    { id: 3, name: "Newspaper", emoji: "📰", type: "recycling" },
    { id: 4, name: "Candy Wrapper", emoji: "🍬", type: "trash" },
  ]);

  const [challengeCompleted, setChallengeCompleted] = useState<boolean>(false);
  const [challengeFailed, setChallengeFailed] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(120);
  const [isDarkMode] = useState<boolean>(true);

  const handleDrop = (bin: keyof Bins, itemId: number): void => {
    const item = availableItems.find((i) => i.id === itemId);

    if (item) {
      if (item.type === bin) {
        setBins((prev) => ({
          ...prev,
          [bin]: [...prev[bin], item],
        }));

        setAvailableItems((prev) => prev.filter((i) => i.id !== itemId));

        const updatedAvailableItems = availableItems.filter(
          (i) => i.id !== itemId
        );
        if (updatedAvailableItems.length === 0) {
          setChallengeCompleted(true);
          setTimeLeft(0);
        }
      } else {
        setBinErrors((prev) => ({
          ...prev,
          [bin]: true,
        }));
        setChallengeFailed(true);
        setTimeLeft(0);
      }
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (!challengeCompleted) {
            setChallengeFailed(true);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [challengeCompleted]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Card
        className={`w-full max-w-4xl shadow-xl ${
          isDarkMode ? "bg-gray-800 text-gray-100" : "bg-white"
        }`}
      >
        <CardHeader className="border-b border-gray-200 dark:border-gray-700 mb-4">
          <div className="flex justify-between items-center w-full">
            <CardTitle className="text-3xl font-bold flex items-center gap-2">
              <span className="text-2xl">🌍</span>
              EcoSort CAPTCHA
            </CardTitle>
            <div className="flex items-center gap-4">
              <div
                className={`px-4 py-2 rounded-full text-sm font-medium ${
                  timeLeft < 30
                    ? "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-200"
                    : "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200"
                }`}
              >
                ⏱️ {timeLeft}s
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {availableItems.map((item) => (
              <div
                key={item.id}
                draggable
                onDragStart={(e: React.DragEvent<HTMLDivElement>) => {
                  e.dataTransfer.setData("itemId", item.id.toString());
                }}
                className={`flex flex-col items-center p-6 rounded-lg ${
                  isDarkMode
                    ? "bg-gray-700 hover:bg-gray-600"
                    : "bg-gray-50 hover:bg-gray-100"
                } cursor-move transition-all duration-200 transform hover:scale-105 hover:shadow-lg`}
              >
                <span className="text-4xl mb-2">{item.emoji}</span>
                <p className="text-sm font-medium text-center">{item.name}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(["recycling", "compost", "trash"] as const).map((bin) => (
              <div
                key={bin}
                onDragOver={(e: React.DragEvent<HTMLDivElement>) =>
                  e.preventDefault()
                }
                onDrop={(e: React.DragEvent<HTMLDivElement>) =>
                  handleDrop(bin, parseInt(e.dataTransfer.getData("itemId")))
                }
                className={`p-6 rounded-lg transition-all duration-300 ${
                  challengeCompleted
                    ? "bg-green-500 dark:bg-green-600"
                    : binErrors[bin]
                    ? "bg-red-500 dark:bg-red-600"
                    : isDarkMode
                    ? "bg-gray-700 hover:bg-gray-600"
                    : "bg-gray-50 hover:bg-gray-100"
                } border-2 border-dashed ${
                  isDarkMode ? "border-gray-600" : "border-gray-200"
                }`}
              >
                <h2 className="text-lg font-semibold capitalize mb-4 text-center">
                  {bin === "recycling" ? "♻️" : bin === "compost" ? "🌱" : "🗑️"}{" "}
                  {bin}
                </h2>
                <div className="min-h-[100px] flex flex-wrap gap-2 justify-center items-center">
                  {bins[bin].map((item) => (
                    <span
                      key={item.id}
                      className="text-3xl transform hover:scale-110 transition-transform"
                    >
                      {item.emoji}
                    </span>
                  ))}
                  {bins[bin].length === 0 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Drop items here
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {challengeCompleted && (
            <Alert className="mt-8 bg-green-500 dark:bg-green-600 text-white border-none">
              <AlertTitle className="text-xl flex items-center gap-2">
                🎉 Congratulations!
              </AlertTitle>
              <AlertDescription className="text-green-50">
                You have successfully sorted all items!
              </AlertDescription>
            </Alert>
          )}

          {challengeFailed && (
            <Alert className="mt-8 bg-red-500 dark:bg-red-600 text-white border-none">
              <AlertTitle className="text-xl flex items-center gap-2">
                ❌ CAPTCHA Failed
              </AlertTitle>
              <AlertDescription className="text-red-50">
                Please try again to sort the items correctly.
              </AlertDescription>
            </Alert>
          )}

          {!challengeCompleted && !challengeFailed && timeLeft === 0 && (
            <Alert className="mt-8 bg-yellow-500 dark:bg-yellow-600 text-white border-none">
              <AlertTitle className="text-xl flex items-center gap-2">
                ⏰ Time is Up!
              </AlertTitle>
              <AlertDescription className="text-yellow-50">
                The CAPTCHA has expired. Please try again.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <div
          className={`mb-8 rounded-lg p-6 m-6 ${
            isDarkMode ? "bg-gray-700" : "bg-blue-50"
          }`}
        >
          <h2 className="text-xl font-semibold mb-4">How to Play</h2>
          <p className="text-base mb-4 text-gray-600 dark:text-gray-300">
            Drag and drop items into their correct recycling bins:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: "♻️ Recycling", items: "Plastic bottles, newspapers" },
              {
                title: "🌱 Compost",
                items: "Organic waste like apple cores",
              },
              {
                title: "🗑️ Trash",
                items: "Non-recyclable items like wrappers",
              },
            ].map((bin) => (
              <div
                key={bin.title}
                className={`p-4 rounded-lg ${
                  isDarkMode ? "bg-gray-600" : "bg-white"
                } shadow-sm`}
              >
                <h3 className="font-medium mb-2">{bin.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {bin.items}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default EcoSortCaptchaPremium;
