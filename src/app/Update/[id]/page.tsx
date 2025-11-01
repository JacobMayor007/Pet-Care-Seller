"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Select } from "antd";
import "@ant-design/v5-patch-for-react-19";
import { faXmark, faCircleArrowDown } from "@fortawesome/free-solid-svg-icons";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, getFirestore, updateDoc } from "firebase/firestore";
import { app } from "@/app/firebase/config";
import ProductNavigation from "@/app/ProductNavigation/page";

interface ProductId {
  params: Promise<{ id: string }>;
}

type OptionValue = string;

export default function UpdateProduct({ params }: ProductId) {
  const { id } = React.use(params);
  const [typeOfPayment, setTypeOfPayment] = useState<OptionValue[]>([]);
  const [productDescription, setProductDescription] = useState<string>("");
  const [preview, setPreview] = useState<string>("");
  const [productName, setProductName] = useState<string>("");
  const [productPrice, setProductPrice] = useState<string | number>(0);
  const [typeOfProduct, setTypeOfProduct] = useState<string>("");
  const [stock, setStock] = useState<string | number>(0);
  const [errorMessage, setErrorMessage] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [dropDown, setDropDown] = useState(false);
  const db = getFirestore(app);

  const itemType = [
    { key: 1, label: "Item" },
    { key: 2, label: "Food" },
  ];

  const options = [
    { id: 1, label: "Cash On Hand", img: "./Cash On Hand Image.svg" },
    { id: 2, label: "GCash", img: "./GCash Image.svg" },
    { id: 3, label: "Debit Or Credit", img: "/Debit Or Credit Card Image.svg" },
  ];

  // Handle user authentication
  const fetchProductData = useCallback(async () => {
    try {
      const productRef = doc(db, "products", id);
      const productSnap = await getDoc(productRef);

      if (productSnap.exists()) {
        const productData = productSnap.data();

        setProductName(productData.Seller_ProductName || "");
        setProductDescription(productData.Seller_ProductDescription || "");
        setProductPrice(productData.Seller_ProductPrice || 0);
        setTypeOfProduct(productData.Seller_TypeOfProduct || "");
        setStock(productData.Seller_StockQuantity || 0);
        setPreview(productData.imageUrl || "");

        // Handle payment methods
        if (productData.Seller_PaymentMethod) {
          if (Array.isArray(productData.Seller_PaymentMethod)) {
            setTypeOfPayment(productData.Seller_PaymentMethod);
          } else {
            setTypeOfPayment([productData.Seller_PaymentMethod]);
          }
        }
      } else {
        console.log("No such product!");
        router.push("/");
      }
    } catch (error) {
      console.error("Error fetching product:", error);
    } finally {
      setLoading(false);
    }
  }, [db, id, router]);

  // Handle user authentication
  useEffect(() => {
    const auth = getAuth(app);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/Login");
      } else {
        fetchProductData();
      }
    });
    return () => unsubscribe();
  }, [router, id, fetchProductData]);

  const handleChange = (value: OptionValue[]) => {
    setTypeOfPayment(value);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      const base64 = await getBase64(selectedFile);
      setPreview(base64);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !productName ||
      productPrice === "0" ||
      !productDescription ||
      stock === "0" ||
      !typeOfProduct
    ) {
      setErrorMessage(true);
      return;
    }

    try {
      const auth = getAuth(app);
      const user = auth.currentUser;

      if (!user) {
        router.push("/Login");
        return;
      }

      const productRef = doc(db, "products", id);

      await updateDoc(productRef, {
        Seller_ProductName: productName,
        Seller_ProductDescription: productDescription,
        Seller_ProductPrice: productPrice,
        Seller_TypeOfProduct: typeOfProduct,
        Seller_StockQuantity: stock,
        Seller_PaymentMethod: typeOfPayment,

        imageUrl: preview,
        updatedAt: new Date().toISOString(),
      });

      router.push("/");
    } catch (error) {
      console.error("Error updating product:", error);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="h-full pb-5 relative">
      <nav className="relative z-20">
        <ProductNavigation />
      </nav>
      <div className="z-10 h-full bg-white py-7 mr-4 pr-8 flex flex-row gap-5 ml-32 my-10 rounded-lg 2xl:px-36">
        <div className="h-full w-1/3 flex flex-col pt-16 px-8 gap-10">
          <div className="flex flex-col justify-start items-start">
            <h1 className="font-hind text-xl text-[#06005B] pb-2 flex flex-col">
              Product Information
              <span className="h-1 w-full bg-[#06005B] rounded-full" />
            </h1>
          </div>
          <div>
            <h1 className="font-hind text-xl text-[#06005B]">Review</h1>
          </div>
        </div>
        <div className="h-full w-2/3 pt-4 flex flex-col gap-3">
          <h1 className="text-2xl font-hind text-[#06005B] tracking-wide font-medium">
            Update Product
          </h1>
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <div className="bg-[#86B2B4] py-8 px-16 rounded-xl">
              <h1 className="text-base text-white font-hind font-medium tracking-wide mb-4">
                Image
              </h1>
              <div className="h-32 flex flex-row items-center px-4 border-white border-[1px] gap-2 rounded-md">
                {preview && (
                  <div>
                    <Image
                      className="object-contain h-16"
                      src={preview}
                      height={96}
                      width={96}
                      alt="Image Product"
                    />
                  </div>
                )}

                <label
                  htmlFor="image-file"
                  className="h-24 w-24 flex flex-col items-center justify-center rounded-md outline-dotted outline-2 outline-[#565656] hover:text-white hover:outline-blue-500 cursor-pointer"
                >
                  <span className="text-2xl">+</span>
                  Upload
                </label>
                <input
                  type="file"
                  accept="image/*"
                  name="images"
                  id="image-file"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
              <div className="flex flex-col gap-3 my-5">
                <h1 className="text-base text-white font-hind font-medium">
                  Name of Product
                </h1>
                <input
                  className="border-[1px] border-white rounded-lg w-full h-10 px-3 outline-none bg-[#86B2B4] text-white"
                  name="productName"
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                />
              </div>

              <div>
                <h1 className="text-base text-white font-hind font-medium">
                  Description
                </h1>
                <textarea
                  className="border-[1px] border-white w-full resize-none rounded-md px-3 py-1 outline-none bg-[#86B2B4] text-white"
                  name="product-description"
                  id="textarea-description"
                  cols={30}
                  rows={3}
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                />
              </div>
              <div className="mt-2">
                <h1 className="text-base text-white font-hind font-medium">
                  Stock
                </h1>
                <input
                  type="number"
                  name="stock"
                  id="stock"
                  value={stock == 0 ? "" : stock}
                  className="border-[1px] border-white rounded-lg w-full h-10 px-3 outline-none bg-[#86B2B4] text-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none placeholder:text-slate-500 placeholder:font-hind placeholder:font-medium placeholder:text-sm"
                  onChange={(e) => setStock(Number(e.target.value))}
                  placeholder="Quantity of Units Ex. 100"
                />
              </div>
              <div className="mt-3">
                <h1 className="text-base text-white font-hind font-medium flex justify-between mb-2">
                  Type
                  <span>
                    <FontAwesomeIcon
                      icon={faCircleArrowDown}
                      className="cursor-pointer"
                      onClick={() => setDropDown((prev) => !prev)}
                    />
                  </span>
                </h1>
                <input
                  type="text"
                  name="type"
                  id="product-type"
                  className="border-[1px] cursor-pointer border-white rounded-lg w-full h-10 px-3 outline-none bg-[#86B2B4] text-white placeholder:text-slate-500 placeholder:font-hind placeholder:font-medium placeholder:text-sm"
                  disabled
                  value={typeOfProduct}
                  onChange={(e) => setTypeOfProduct(e.target.value)}
                  placeholder="Food or Item"
                />
              </div>
              {dropDown && (
                <div>
                  {itemType.map((data) => (
                    <li
                      key={data.key}
                      className="flex flex-col drop-shadow-lg cursor-pointer font-hind font-medium text-base bg-transparent text-white px-4 my-2 py-2 rounded-xl hover:bg-blue-300"
                      onClick={() => {
                        setTypeOfProduct(data.label);
                        setDropDown(false);
                      }}
                    >
                      {data.label}
                    </li>
                  ))}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-4 bg-[#86B2B4] py-8 px-16 rounded-xl">
              <div>
                <h1 className="text-base font-hind font-medium text-white">
                  Price
                </h1>
                <input
                  className="w-full bg-[#86B2B4] h-10 rounded-md px-2 outline-none text-base font-hind font-medium border-[1px] border-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none text-white"
                  name="productPrice"
                  value={productPrice == 0 ? "" : productPrice}
                  onChange={(e) => setProductPrice(Number(e.target.value))}
                  type="number"
                />
              </div>

              <div>
                <h1 className="text-white font-hind text-lg tracking-wide font-medium">
                  Type Of Payment
                </h1>
                <Select
                  mode="multiple"
                  allowClear
                  style={{
                    width: "100%",
                    backgroundColor: "#86B2B4",
                  }}
                  placeholder="Please select"
                  onChange={handleChange}
                  value={typeOfPayment}
                  options={options.map((option) => ({
                    value: option.label,
                    label: option.label,
                  }))}
                />
              </div>
            </div>

            <div className="flex flex-row items-center justify-between">
              <Link
                className="p-2 w-24 font-hind text-base border-[1px] border-black shadow-sm shadow-slate-500 flex items-center justify-center rounded-lg"
                href="/"
              >
                Cancel
              </Link>

              <button
                className="cursor-pointer border-[1px] border-black p-2 w-24 rounded-lg text-base font-hind tracking-wide shadow-md shadow-gray-700 text-white bg-[#06005b] flex items-center justify-center"
                type="submit"
              >
                Update
              </button>
            </div>
          </form>
        </div>
      </div>

      {errorMessage && (
        <div className="h-[200vh] w-screen absolute top-0 z-[1]">
          <div className="h-full w-full absolute top-0 z-[1] blur-sm backdrop-blur-sm" />
          <div className="z-[2] relative flex-col mx-[40%] my-[20%]">
            <FontAwesomeIcon
              icon={faXmark}
              className="ml-64 cursor-pointer"
              onClick={() => setErrorMessage(false)}
            />
            <div className="p-4 bg-white rounded-lg flex flex-col w-auto">
              <h1 className="font-montserrat text-red-600 font-medium text-xl">
                Make sure to provide the following fields
              </h1>
              <p className="text-lg font-hind font-medium text-yellow-300">
                Product Name
              </p>
              <p className="text-lg font-hind font-medium text-yellow-300">
                Product Description
              </p>
              <p className="text-lg font-hind font-medium text-yellow-300">
                Product Price
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const getBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};
