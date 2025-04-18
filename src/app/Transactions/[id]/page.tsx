"use client";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { fetchOrder, paidProduct, shippedProduct } from "../fetchOrder";
import "@ant-design/v5-patch-for-react-19";
import ProductNavigation from "@/app/ProductNavigation/page";
import { Modal, Rate } from "antd";

interface Order_ID {
  params: Promise<{ id: string }>;
}

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

export default function Product({ params }: Order_ID) {
  const { id } = React.use(params);
  const [listOfOrders, setListOfOrders] = useState<Order | null>(null);
  const [confirmPaid, setConfirmPaid] = useState(false);
  const [confirmShipped, setConfirmShipped] = useState(false);

  useEffect(() => {
    const getMyOrder = async () => {
      try {
        const myOrders = await fetchOrder(id);
        setListOfOrders(myOrders);
      } catch (error) {
        console.error(error);
        setListOfOrders(null);
      }
    };

    getMyOrder();
  }, [id]);

  const handleShippingProduct = async (
    order_ID: string,
    userUID: string,
    buyerUID: string,
    item: string
  ) => {
    if (!order_ID) {
      console.log("Error ID fetch");
    }

    try {
      shippedProduct(order_ID, userUID, buyerUID, item);
      // window.location.reload();
    } catch (err) {
      console.error(err);
    } finally {
      window.location.reload();
    }
  };

  const handlePaidProduct = async (
    order_ID: string,
    sellerID: string,
    buyerUID: string,
    productName: string
  ) => {
    if (!order_ID) {
      throw "Order ID is undefined";
    }

    try {
      await paidProduct(order_ID, sellerID, buyerUID, productName);
    } catch (err) {
      console.error(err);
    } finally {
      window.location.reload();
    }
  };

  return (
    <div>
      <nav className="relative z-20">
        <ProductNavigation />
      </nav>
      <div className="flex mx-52 my-10 flex-col gap-8 z-10">
        <h1 className="font-bold font-montserrat text-4xl ">Transactions</h1>
        <div className="grid grid-cols-5 bg-white drop-shadow-lg h-fit rounded-2xl p-8 gap-5">
          <h1
            className={`${
              listOfOrders?.OC_Status === "shipped"
                ? `col-span-2`
                : `col-span-3 `
            } font-montserrat text-3xl font-bold text-[#393939]`}
          >
            Pet
          </h1>
          <h1 className="font-montserrat text-3xl font-bold text-[#393939] justify-self-center">
            Price
          </h1>
          <h1 className="font-montserrat text-3xl font-bold text-[#393939] justify-self-center">
            {listOfOrders?.OC_RatingAndFeedback?.feedback
              ? `Feedback `
              : `Status`}
          </h1>
          <div className="w-full h-0.5 rounded-full bg-[#B1B1B1] col-span-5 flex flex-col" />

          <div className="grid grid-cols-5 col-span-5 items-center px-4 py-6 border-b-[1px] border-[#C3C3C3]">
            <div className="">
              <h1 className="font-hind font-bold">
                Image of {listOfOrders?.OC_BuyerFullName}
              </h1>
            </div>
            <div
              className={`${
                listOfOrders?.OC_Status !== "shipped"
                  ? `col-span-2`
                  : `col-span-1`
              } flex flex-col gap-0.5`}
            >
              <div className="flex flex-row gap-4">
                <p className="font-hind font-bold text-[#006B95]">
                  Buyer: {listOfOrders?.OC_BuyerFullName}{" "}
                </p>
                {!listOfOrders?.OC_RatingAndFeedback?.rating ? (
                  ""
                ) : (
                  <span>
                    <Rate
                      value={listOfOrders?.OC_RatingAndFeedback?.rating}
                      disabled
                    />
                  </span>
                )}
              </div>
              <h1 className="font-montserrat font-bold text-lg">
                {" "}
                {listOfOrders?.OC_Products?.OC_ProductName}
              </h1>
              <div className="flex flex-row items-center gap-4">
                <Image
                  src={`/${listOfOrders?.OC_PaymentMethod} Image.svg`}
                  alt={`${listOfOrders?.OC_PaymentMethod} Image`}
                  height={20}
                  width={20}
                  className="object-contain"
                />
                <p className="font-hind text-xl text-[#232323]">
                  {listOfOrders?.OC_PaymentMethod}
                </p>
              </div>
            </div>
            <div className="justify-self-center font-hind text-[#232323] text-xl font-medium">
              Php {listOfOrders?.OC_TotalPrice}
            </div>
            {listOfOrders?.OC_Status === "pending" ? (
              <button
                className="justify-self-center h-fit py-2 w-48 font-montserrat font-bold text-base bg-[#006B95] text-white rounded-md"
                onClick={() => setConfirmShipped(true)}
              >
                Click here if shipped
              </button>
            ) : (
              <h1
                className={`text-center font-montserrat ${
                  listOfOrders?.OC_RatingAndFeedback?.feedback
                    ? `text-base`
                    : `text-xs italic text-[#006B95]`
                } font-bold `}
              >
                {listOfOrders?.OC_Status === "paid"
                  ? `${
                      listOfOrders?.OC_RatingAndFeedback?.feedback
                        ? listOfOrders.OC_RatingAndFeedback.feedback
                        : `Please wait, ${listOfOrders.OC_BuyerFullName} will have it's feedback`
                    }  `
                  : `Shipped`}
              </h1>
            )}

            {listOfOrders?.OC_Status === "shipped" ? (
              <button
                type="button"
                className=" h-fit py-2 w-fit px-4 ml-8 bg-[#006B95] text-white rounded-md"
                onClick={() => setConfirmPaid(true)}
              >
                Click here if Paid
              </button>
            ) : (
              <button className="hidden" />
            )}

            <Modal
              open={confirmPaid}
              onOk={() => {
                setConfirmPaid(false);
                handlePaidProduct(
                  listOfOrders?.id || "",
                  listOfOrders?.OC_SellerID || "",
                  listOfOrders?.OC_BuyerID || "",
                  listOfOrders?.OC_Products?.OC_ProductName || ""
                );
              }}
              centered
              onClose={() => setConfirmPaid(false)}
              onCancel={() => setConfirmPaid(false)}
            >
              <h1 className="font-montserrat font-bold text-[#006B95]">
                Please confirm that patient {listOfOrders?.OC_BuyerFullName} is
                paid?
              </h1>
            </Modal>

            <Modal
              open={confirmShipped}
              onCancel={() => setConfirmShipped(false)}
              onClose={() => setConfirmShipped(false)}
              centered
              onOk={() => {
                handleShippingProduct(
                  listOfOrders?.id || "",
                  listOfOrders?.OC_SellerID || "",
                  listOfOrders?.OC_BuyerID || "",
                  listOfOrders?.OC_Products?.OC_ProductName || ""
                );
                setConfirmShipped(false);
              }}
            >
              <h1>
                Please confirm that the product{" "}
                {listOfOrders?.OC_Products?.OC_ProductName} is shipped?
              </h1>
            </Modal>
          </div>
        </div>
      </div>
    </div>
  );
}
