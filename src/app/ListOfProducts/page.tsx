"use client";

import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { app, db } from "../firebase/config";
import { collection, getDocs, query, where } from "firebase/firestore";
import ProductNavigation from "../ProductNavigation/page";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPesoSign } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

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

export default function ListOfProducts() {
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [userProduct, setUserProduct] = useState<Product[]>([]);

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
  }, [router]);

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
      } catch (error) {
        console.error("Error fetching on your products", error);
        return [];
      }
    };
    myProducts();
  }, [userId, userProduct]);

  return (
    <div>
      <nav className="relative z-20">
        <ProductNavigation />
      </nav>
      <div className="mx-56">
        <h1 className="font-montserrat font-bold text-3xl text-[#393939] my-8">
          My Products
        </h1>
        <div className="grid grid-cols-4 gap-6 grid-rows-[300px]">
          {userProduct.map((data, index) => {
            return (
              <div
                key={index}
                className="bg-white drop-shadow-xl shadow-black rounded-xl p-4 grid grid-rows-[110px_auto_auto_auto_auto] cursor-pointer"
              >
                <div className="flex justify-center ">
                  {data?.Seller_ProductName?.charAt(0)}
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
                <Link
                  href={`/Update/${data?.id}`}
                  className="bg-[#006B95] text-white p-1 rounded-md flex items-center justify-center"
                >
                  Edit Item
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
