"use client";
import { useEffect, useState } from "react";
import ProductNavigation from "../ProductNavigation/page";
import { collection, getDocs, query, where } from "firebase/firestore";
import { app, db } from "../firebase/config";
import { isAuthenticate } from "../fetchData/fetchUserData";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Rate } from "antd";
import Link from "next/link";

interface Order {
  id?: string;
  OC_BuyerFullName?: string;
  OC_BuyerID?: string;
  OC_ContactNumber?: string;
  OC_DeliverAddress?: string;
  OC_DeliverTo?: string;
  OC_OrderAt?: string;
  OC_PaymentMethod?: string;
  OC_Products?: {
    OC_ProductID?: string;
    OC_ProductName?: string;
    OC_ProductPrice?: string;
    OC_ProductQuantity?: number;
    OC_ShippingFee?: number;
  };
  OC_SellerFullName?: string;
  OC_SellerID?: string;
  OC_Status?: string;
  OC_TotalPrice?: number;
  OC_RatingAndFeedback?: {
    feedback?: string;
    rating?: number;
  };
}

export default function Transactions() {
  const [listOfOrders, setListOfOrders] = useState<Order[]>([]);
  const [userId, setUserId] = useState("");

  const router = useRouter();

  useEffect(() => {
    const auth = getAuth(app);

    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId("");
        router.push("/Login");
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const getListOfOrders = async () => {
      try {
        const productsRef = collection(db, "Orders");
        const myProductsQuery = query(
          productsRef,
          where("OC_SellerID", "==", userId)
        );

        const myProductsSnapshot = await getDocs(myProductsQuery);

        const myProducts = myProductsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setListOfOrders(myProducts);
      } catch (error) {
        console.error(error);
      }
    };
    getListOfOrders();
  }, [userId]);

  console.log(listOfOrders);

  return (
    <div>
      <nav className="relative z-20">
        <ProductNavigation />
      </nav>
      <div className="mx-56 flex flex-col">
        <h1 className="my-8 font-montserrat font-bold text-3xl text-[#393939]">
          Transactions
        </h1>
        <div className="flex flex-col gap-6 my-8">
          {listOfOrders.map((data, index) => {
            return (
              <div
                key={index}
                className="grid grid-cols-5 bg-white drop-shadow-lg h-48 rounded-2xl p-8 gap-5 relative"
              >
                <div className="w-40 my-auto h-20 text-center rounded-md bg-white drop-shadow-md overflow-hidden text-ellipsis">
                  Image of {data?.OC_Products?.OC_ProductName}
                </div>
                <div className="col-span-2 flex flex-col gap-1">
                  <h1>
                    Buyer:{" "}
                    <span className="font-montserrat text-[#006B95] capitalize font-semibold">
                      {data?.OC_BuyerFullName}
                    </span>{" "}
                  </h1>
                  <p className="font-hind text-[#393939]">
                    Product:{" "}
                    <span className="font-semibold">
                      {data?.OC_Products?.OC_ProductName}
                    </span>
                  </p>
                  <p className="font-montserrat text-[#393939]">
                    Price:{" "}
                    <span className="font-bold">
                      Php {data?.OC_Products?.OC_ProductPrice}
                    </span>
                  </p>
                  <p className="font-hind text-[#393939]">
                    Quantity:{" "}
                    <span className="font-bold">
                      {data?.OC_Products?.OC_ProductQuantity}
                    </span>
                  </p>
                </div>
                <div className="m-auto font-montserrat font-bold text-[#393939] capitalize text-2xl">
                  {data?.OC_Status}
                </div>
                <div className="m-auto">
                  <Rate value={data?.OC_RatingAndFeedback?.rating} />
                  <p className="max-h-28 overflow-hidden text-ellipsis line-clamp-3">
                    {data?.OC_RatingAndFeedback?.feedback}
                  </p>
                </div>
                <Link
                  href={`/Transactions/${data?.id}`}
                  className="absolute  italic right-10 underline text-[#006B95]"
                >
                  View More Details
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
