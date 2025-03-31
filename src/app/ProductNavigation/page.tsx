"use client";
import Link from "next/link";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import { BellOutlined, UserOutlined } from "@ant-design/icons";
import { useEffect, useRef, useState } from "react";
import fetchUserData from "../fetchData/fetchUserData";
import Signout from "../Signout/page";
import {
  notifications,
  unopenNotification,
} from "../fetchData/fetchNotification";
import {
  collection,
  DocumentData,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { useRouter } from "next/navigation";
import * as Notification from "@/app/fetchData/fetchNotification";

interface Notifications {
  id?: string;
  createdAt?: string;
  order_ID?: string;
  message?: string;
  sender?: string;
  receiver?: string;
  status?: string;
  open?: boolean;
  title?: string;
  type?: string;
  hide?: boolean;
}

export default function ProductNavigation() {
  const profileRef = useRef<HTMLDivElement | null>(null);
  const [logout, setLogout] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [userData, setUserData] = useState<DocumentData[]>([]);
  const router = useRouter();
  const [unreadNotif, setUnreadNotif] = useState(0);

  useEffect(() => {
    const getName = async () => {
      const data = await fetchUserData();
      setUserData(data);
    };
    getName();
  }, []);

  const latestChats = async () => {
    try {
      if (!userData[0]?.User_Email) {
        console.error("User UID is not defined.");
        return;
      }

      const docRef = collection(db, "chats");
      const q = query(
        docRef,
        where("participants", "array-contains", userData[0]?.User_Email)
      );
      const docSnap = await getDocs(q);

      if (docSnap.empty) {
        console.log("No chats found.");
        router.push("/Message");
      } else {
        const otherUser = docSnap.docs.map((doc) => {
          const chatData = doc.data();
          const otherUserEmail = chatData.participants.find(
            (email: string) => email !== userData[0]?.User_Email
          );
          return otherUserEmail;
        });

        const otherUserEmail = otherUser[0];

        const userRef = collection(db, "Users");
        const userQ = query(userRef, where("User_Email", "==", otherUserEmail));
        const userSnap = await getDocs(userQ);

        let otherID: string = "";
        if (!userSnap.empty) {
          otherID = userSnap.docs[0].id;
        }

        router.push(`/Message/${otherID}`);
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
    }
  };

  useEffect(() => {
    let unsubscribe: () => void;

    const getMyNotification = async () => {
      try {
        if (!userData[0]?.User_UID) {
          console.log("No doctor UID found.");
          return;
        }

        // Call backend function and pass a callback to update state
        unsubscribe = unopenNotification(userData[0]?.User_UID, (newNotif) => {
          setUnreadNotif(newNotif.length);
        });
      } catch (err) {
        console.error("Error fetching notifications:", err);
      }
    };

    getMyNotification();

    // Cleanup listener on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [userData[0]?.User_UID]);

  useEffect(() => {
    const closeNotification = (e: MouseEvent) => {
      if (!profileRef.current?.contains(e.target as Node)) {
        setShowNotif(false);
        setLogout(false);
      }
    };

    document.body.addEventListener("mousedown", closeNotification);

    return () => {
      document.body.removeEventListener("mouseover", closeNotification);
    };
  }, [showNotif]);

  return (
    <nav className="h-20 flex flex-row justify-center items-center relative z-20">
      <div className="flex items-center gap-16 px-24">
        <div className="flex items-center w-44">
          <Image src="/Logo.svg" height={54} width={54} alt="Logo" />
          <h1 className="text-2xl font-sigmar font-normal text-[#006B95]">
            Pet Care
          </h1>
        </div>
        <ul className="list-type-none flex flex-row items-center gap-3">
          <li className="w-28 h-14 flex items-center justify-center">
            <Link
              href="/"
              className="font-montserrat text-base text-[#006B95] font-bold"
            >
              Dashboard
            </Link>
          </li>
          <li className="w-44 h-14 flex items-center justify-center font-bold cursor-pointer">
            <div
              className="font-montserrat text-base text-[#006B95] font-bold "
              onClick={() => {
                latestChats();
              }}
            >
              Inbox
            </div>
          </li>
          <li className="w-30 h-14 flex items-center justify-center ">
            <Link
              className="font-montserrat text-base text-[#006B95] font-bold"
              href="/ListOfProducts"
            >
              List of Products
            </Link>
          </li>
          <li className="w-fit px-4 h-14 flex items-center justify-center">
            <Link
              className="font-montserrat text-base text-[#006B95] font-bold"
              href="/AddProduct"
            >
              Add New Product
            </Link>
          </li>
        </ul>
        <div className="flex flex-row items-center gap-4" ref={profileRef}>
          <div className="relative cursor-pointer flex flex-row items-center gap-4  ">
            <BellOutlined
              onClick={() => {
                setShowNotif((prev) => !prev);
                setLogout(logout === true ? false : logout);
                Notification.openNotification(userData[0]?.User_UID);
              }}
              className="text-[#006B95] font-bold text-lg cursor-pointer relative"
            />
            <UserOutlined
              className="text-[#006B95] font-bold text-lg cursor-pointer"
              onClick={() => {
                setLogout((prev) => !prev);
                setShowNotif(false);
              }}
            />
            <div
              className={
                unreadNotif > 0
                  ? `flex absolute -top-2 left-2 h-4 w-4 text-xs bg-red-500 cursor-pointer text-white rounded-full justify-center items-center`
                  : `hidden`
              }
            >
              {unreadNotif < 0 ? `` : unreadNotif}
            </div>
            <div
              className={
                logout
                  ? `grid grid-rows-6 justify-center items-center bg-[#F3F3F3] drop-shadow-xl rounded-lg absolute top-10 -left-20 cursor-pointer h-fit w-56`
                  : `hidden`
              }
            >
              <h1 className="font-montserrat font-bold text-[#006B95] text-center capitalize border-b-[1px] border-[#B1B1B1]">
                {userData[0]?.User_Name}{" "}
              </h1>
              <Link
                href={`/Profile/${userData[0]?.User_UID}`}
                className="text-center font-hind  h-full w-44 flex items-center justify-center border-b-[1px] border-[#B1B1B1]"
              >
                My Profile
              </Link>
              <Link
                href={`/Doctor`}
                className="text-center font-hind  h-full w-44 flex items-center justify-center border-b-[1px] border-[#B1B1B1]"
              >
                Want to become part of our doctors?
              </Link>
              <Link
                href={`/Provider`}
                className="text-center font-hind  h-full w-44 flex items-center justify-center border-b-[1px] border-[#B1B1B1]"
              >
                Want to become part of our product sellers?
              </Link>
              <Link
                href={`/Renter`}
                className="text-center font-hind  h-full w-44 flex items-center justify-center border-b-[1px] border-[#B1B1B1]"
              >
                Want to become part of our renters?
              </Link>
              <Link
                href={`/Settings`}
                className="text-center font-hind  h-full w-44 flex items-center justify-center border-b-[1px] border-[#B1B1B1]"
              >
                Settings
              </Link>

              <Signout />
            </div>
            <div
              className={
                showNotif
                  ? `flex absolute top-5 right-12 cursor-pointer transform-gpu ease-in-out duration-300`
                  : `hidden`
              }
            >
              <UserNotification />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

const UserNotification = () => {
  const [notif, setNotif] = useState<Notifications[]>([]);

  useEffect(() => {
    let unsubscribe: () => void;

    const getMyNotifications = async () => {
      try {
        const data = await fetchUserData();
        const userUID = data[0]?.User_UID;

        if (!userUID) {
          console.log("Logged In First");
          return;
        }

        unsubscribe = notifications(userUID, (newNotif) => {
          setNotif(newNotif);
        });
      } catch (error) {
        console.log(error);
      }
    };

    getMyNotifications();

    // Cleanup listener on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  return (
    <div className="max-w-[500px] w-[482px] h-fit max-h-[542px] bg-white drop-shadow-lg rounded-xl justify-self-center flex flex-col pb-1">
      <h1 className="font-hind text-lg mx-4 mt-4 mb-2">Notifications</h1>
      <div className="h-0.5 border-[#393939] w-full border-[1px] mb-2" />
      {notif.map((data) => {
        return (
          <div
            key={data?.id}
            className=" drop-shadow-lg grid grid-cols-12 p-1 items-center"
          >
            <div className="m-2 h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
            <div className="grid grid-cols-12 my-2 col-span-11">
              <Link
                href={`/Provider/Orders/${data?.order_ID}`}
                className="col-span-11 grid grid-cols-12"
                onClick={() => Notification.readNotification(data?.id || "")}
              >
                <div className="h-12 w-12 col-span-2 rounded-full bg-white drop-shadow-lg font-montserrat text-xs flex items-center justify-center text-center text-nowrap overflow-hidden">
                  Image of <br />
                  Pet
                </div>
                <div className="flex flex-col gap-1 font-montserrat text-wrap col-span-10 text-sm">
                  <h1 className="text-[#393939] font-medium">
                    {data?.message}
                  </h1>
                  <p className="text-xs text-[#797979]">{data?.createdAt}</p>
                </div>
              </Link>
              <div
                className="flex justify-center mt-0.5 "
                onClick={() => Notification.hideNotification(data?.id || "")}
              >
                <FontAwesomeIcon icon={faEyeSlash} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
