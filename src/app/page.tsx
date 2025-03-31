"use client";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db, app } from "./firebase/config";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";
// import fetchProduct from "../fetchData/fetchProducts";
import { collection, getDocs, query, where } from "firebase/firestore";
import { totalOrder } from "./fetchData/fetchTotalOrder";

import {
  faArrowUp,
  faFileShield,
  faPesoSign,
} from "@fortawesome/free-solid-svg-icons";
import dayjs, { Dayjs } from "dayjs";
import ProductNavigation from "./ProductNavigation/page";

interface Product {
  id?: string;
  Seller_PaymentMethod?: string;
  Seller_ProductDescription?: string;
  Seller_ProductFeatures?: string; // Assuming this is a string representation of an array or object
  Seller_ProductName?: string;
  Seller_ProductPrice?: string; // Assuming the price comes as a string from Firebase
  Seller_StockQuantity?: string;
  Seller_TotalPrice?: number;
  Seller_TypeOfProduct?: string;
  Seller_UserFullName?: string;
  Seller_UserID?: string;
}

interface Orders {
  id?: string;
  OC_BuyerID?: string;
  OC_BuyerFullName?: string;
  OC_ContactNumber?: string;
  OC_DeliverAddress?: string;
  OC_DeliverTo?: string;
  OC_OrderAt?: Dayjs | null;
  OC_PaymentMethod?: string;
  OC_Products?: {
    OC_ProductID?: string;
    OC_ProductName?: string;
    OC_ProductPrice?: string;
    OC_ProductQuantity?: number;
    OC_ShippingFee?: number;
  };
  OC_RatingAndFeedback?: {
    feedback?: string;
    rating?: number;
  };
  OC_SellerFullName?: string;
  OC_SellerID?: string;
  OC_Status?: string;
  OC_TotalPrice?: number;
}

export default function Overview() {
  const [userId, setUserId] = useState("");
  const [userProduct, setUserProduct] = useState<Product[]>([]);
  const [order, setOrder] = useState<Orders[]>([]);
  const [userTotalProduct, setUserTotalProduct] = useState(0);
  const [totalOrders, setTotalOrders] = useState<number | null>(0);

  useEffect(() => {
    const myProducts = async () => {
      try {
        const productsRef = collection(db, "products");
        const myProductsQuery = query(
          productsRef,
          where("Seller_UserID", "==", userId)
        );

        const myProductsSnapshot = await getDocs(myProductsQuery);
        const myProducts = myProductsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUserProduct(myProducts);
        setUserTotalProduct(myProducts.length);
      } catch (error) {
        console.error("Error fetching on your products", error);
        return [];
      }
    };
    myProducts();
  }, [userId, userProduct]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!userId) return;
      const orders = await totalOrder(userId);
      setOrder(
        orders.map((order: Orders) => ({
          ...order,
          OC_OrderAt: order?.OC_OrderAt
            ? dayjs(order?.OC_OrderAt.toDate())
            : null,
        }))
      );
      setTotalOrders(orders?.length || 0);
    };

    fetchOrders();
  }, [userId]);

  const router = useRouter();
  const units: number = totalOrders || 0;
  const pendingUnits = totalOrders || 0;
  const pending: number = (pendingUnits / units) * 100;
  const shippedUnits = totalOrders || 0;
  const shipped: number = (shippedUnits / units) * 100;
  const deliveredUnits = totalOrders || 0;
  const delivered: number = (deliveredUnits / units) * 100;

  useEffect(() => {
    const auth = getAuth(app);

    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Retrieve the user's unique ID
        setUserId(user.uid);
      } else {
        // No user is signed in
        setUserId("");
        router.push("/Login");
      }
    });

    // Cleanup the subscription when the component is unmounted
    return () => unsubscribe();
  });

  const totalPrice = order.reduce((accumulator, currentValue) => {
    return accumulator + Number(currentValue?.OC_Products?.OC_ProductPrice);
  }, 0);

  return (
    <div className={userId ? `bg-[#FEFEFE] pb-5` : `hidden`}>
      <nav className="relative z-20">
        <ProductNavigation />
      </nav>
      <div className="flex flex-col px-36 pt-10 pb-5 gap-4 z-10">
        <div className="grid grid-cols-3 grid-rows-[auto_135px] gap-4">
          <h1 className="col-span-3 font-montserrat font-bold text-4xl">
            This month&lsquo;s overview
          </h1>
          <div className="flex items-center justify-center flex-col bg-white drop-shadow-xl  shadow-black rounded-xl">
            <h1 className="text-[#26A2AB] text-3xl font-montserrat font-semibold">
              {totalOrders}
              <span className="ml-4">
                <FontAwesomeIcon
                  icon={faArrowUp}
                  className="text-[rgb(0,255,0)]"
                />
              </span>
            </h1>
            <p className="font-montserrat font-semibold text-lg text-[#565656]">
              Total Orders
            </p>
          </div>
          <div className="flex flex-col items-center justify-center bg-white drop-shadow-xl  shadow-black rounded-xl">
            <div className="flex flex-row gap-2">
              <FontAwesomeIcon
                icon={faPesoSign}
                className="text-3xl font-semibold font-montserrat text-[#26A2AB]"
              />{" "}
              <h1 className="text-3xl font-semibold font-montserrat text-[#26A2AB] tracking-widest">
                {totalPrice}
              </h1>
              <FontAwesomeIcon
                icon={faArrowUp}
                className="text-[rgb(0,255,0)] text-3xl font-semibold font-montserrat ml-2"
              />
            </div>
            <p className="font-montserrat font-semibold text-lg text-[#565656]">
              Total Sell
            </p>{" "}
          </div>
          <div className="flex flex-col items-center justify-center bg-white drop-shadow-xl  shadow-black rounded-xl">
            <h1 className="text-3xl font-semibold font-montserrat text-[#26A2AB] tracking-widest">
              {userTotalProduct}
            </h1>
            <p className="font-montserrat font-semibold text-lg text-[#565656] ">
              Products Listed
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 grid-rows-[auto_135px] gap-4">
          <h1 className="col-span-3 font-montserrat font-bold text-4xl">
            Last Month&lsquo;s Overview
          </h1>
          <div className="flex items-center justify-center flex-col bg-white drop-shadow-xl  shadow-black rounded-xl">
            <h1 className="text-[#26A2AB] text-3xl font-montserrat font-semibold">
              {totalOrders}
            </h1>
            <p className="font-montserrat font-semibold text-lg text-[#565656]">
              Total Orders
            </p>
          </div>
          <div className="flex items-center justify-center flex-col bg-white drop-shadow-xl  shadow-black rounded-xl">
            <div className="flex flex-row gap-2">
              <FontAwesomeIcon
                icon={faPesoSign}
                className="text-3xl font-semibold font-montserrat text-[#26A2AB]"
              />
              <h1 className="text-3xl font-semibold font-montserrat text-[#26A2AB] tracking-widest">
                {totalPrice}
              </h1>
              <FontAwesomeIcon
                icon={faArrowUp}
                className="text-[rgb(0,255,0)] text-3xl font-semibold font-montserrat ml-2"
              />
            </div>
            <p className="font-montserrat font-semibold text-lg text-[#565656]">
              Total Sell
            </p>
          </div>
          <div className="flex items-center justify-center flex-col bg-white drop-shadow-xl  shadow-black rounded-xl">
            <h1 className="text-3xl font-semibold font-montserrat text-[#26A2AB] tracking-widest">
              {userTotalProduct}
            </h1>
            <p className="font-montserrat font-semibold text-lg text-[#565656]">
              Products Listed
            </p>
          </div>
        </div>
        <div className="grid grid-cols-[30%_66%] gap-8 w-full h-full">
          <div className="mt-8">
            {" "}
            <h1 className="font-montserrat font-bold text-4xl row-span-1">
              Order Summary
            </h1>
            <div className="h-[572px] grid grid-rows-[140px_140px_140px] gap-14 ">
              <div className="bg-white drop-shadow-xl shadow-black rounded-xl p-5 flex flex-col gap-3">
                <p className="text-xl font-montserrat font-bold text-[#565656]">
                  Pending Orders
                </p>
                <div className="flex flex-row items-center justify-between ">
                  <h1
                    className={
                      totalOrders === 0
                        ? `text-xl font-semibold`
                        : `text-3xl font-hind font-semibold`
                    }
                  >
                    {totalOrders === 0 ? `You have no orders` : `${pending}%`}
                  </h1>
                  <p className="font-montserrat font-bold text-lg text-[#565656]">
                    {pendingUnits} / {units}
                  </p>
                </div>
                <div className={`h-2 w-full bg-gray-300 rounded-full`}>
                  <div
                    className={`h-full bg-[#22A9FD] rounded-full`}
                    style={{ width: `${pending}%` }}
                  />
                </div>
              </div>
              <div className="bg-white drop-shadow-xl shadow-black rounded-xl p-5 flex flex-col gap-3">
                <p className="text-xl font-montserrat font-bold text-[#565656]">
                  Shipped Orders
                </p>
                <div className="flex items-center justify-between">
                  <h1
                    className={
                      totalOrders === 0
                        ? `text-xl font-semibold`
                        : `text-3xl font-hind font-semibold`
                    }
                  >
                    {totalOrders === 0 ? `You have no orders` : `${shipped}%`}
                  </h1>

                  <p className="font-montserrat font-bold text-lg text-[#565656]">
                    {shippedUnits} / {units}
                  </p>
                </div>
                <div className={`h-2 w-full bg-gray-300 rounded-full`}>
                  <div
                    className={`h-full bg-[#22A9FD] rounded-full`}
                    style={{ width: `${shipped}%` }}
                  />
                </div>
              </div>
              <div className="bg-white drop-shadow-xl shadow-black rounded-xl p-5 flex flex-col gap-3">
                <p className="text-xl font-montserrat font-bold text-[#565656]">
                  Delivered Orders
                </p>
                <div className="flex items-center justify-between">
                  <h1
                    className={
                      totalOrders === 0
                        ? `text-xl font-semibold`
                        : `text-3xl font-hind font-semibold`
                    }
                  >
                    {totalOrders === 0 ? `You have no orders` : `${delivered}`}
                  </h1>
                  <p className="font-montserrat font-bold text-lg text-[#565656]">
                    {deliveredUnits} / {units}
                  </p>
                </div>
                <div className={`h-2 w-full bg-gray-300 rounded-full`}>
                  <div
                    className={`h-full bg-[#22A9FD] rounded-full`}
                    style={{ width: `${shipped}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="h-[572px] mt-8 ">
            <h1 className="font-montserrat font-bold text-4xl">
              Review Orders
            </h1>
            <div className="grid grid-cols-3 mt-4 drop-shadow-md bg-white p-4 rounded-lg">
              <h1 className="text-center text-2xl font-montserrat font-bold text-[#393939] ">
                Date
              </h1>
              <h1 className="text-center text-2xl font-montserrat font-bold text-[#393939]">
                Item and Customer
              </h1>
              <h1 className="text-center text-2xl font-montserrat font-bold text-[#393939]">
                Destination
              </h1>
              {order?.map((data) => {
                return (
                  <div
                    className="col-span-3 grid grid-cols-3 my-4 gap-4 items-center"
                    key={data?.id}
                  >
                    <p className="text-center font-hind text-[#565656] text-lg">
                      {data?.OC_OrderAt?.format("MMMM DD, YYYY")}
                    </p>
                    <div className="">
                      <p className="font-hind font-semibold text-base text-[#565656] ">
                        {data?.OC_Products?.OC_ProductName}
                      </p>
                      <p className="font-hind text-base text-[#797979]">
                        {data?.OC_BuyerFullName}
                      </p>
                    </div>
                    <div>
                      <p className="font-hind font-semibold text-[#565656] text-center text-ellipsis text-nowrap overflow-hidden">
                        {data?.OC_DeliverAddress}
                      </p>
                      <div className="flex justify-center">
                        <p className="text-center w-fit py-2 px-4 my-2 border-[1px] border-[#C3C3C3] bg-[#FAEEFF] text-[#9956B8] rounded-md font-montserrat">
                          {data?.OC_Status === "pending"
                            ? `In transit`
                            : data?.OC_Status === "shipped"
                            ? "Delivered"
                            : data?.OC_Status === "paid"
                            ? `Completed`
                            : ""}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="pb-5">
          <div className="grid grid-cols-4 gap-6 grid-rows-[300px]">
            {userProduct.map((data, index) => {
              return (
                <div
                  key={index}
                  className="bg-white drop-shadow-xl shadow-black rounded-xl p-4 grid grid-rows-[110px_auto_auto_auto_auto] cursor-pointer"
                >
                  <div className="flex justify-center ">
                    <FontAwesomeIcon icon={faFileShield} className="text-8xl" />
                  </div>
                  <h1 className="font-hind text-[#006B95] tracking-wide">
                    37 Orders {`(This month)`}
                  </h1>
                  <p className="text-[#565656] font-hind font-semibold text-sm">
                    {data?.Seller_ProductName}
                  </p>
                  <p className="text-sm font-hind font-semibold text-[#565656]">
                    <span>
                      <FontAwesomeIcon icon={faPesoSign} />
                    </span>
                    {data?.Seller_ProductPrice}
                  </p>
                  <button className="bg-[#006B95] text-white p-1 rounded-md">
                    Edit Item
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
