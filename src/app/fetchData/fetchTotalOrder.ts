import { getDocs, query, where,collection } from "firebase/firestore";
import { db } from "@/app/firebase/config";

// interface Orders {
//     id?: string;
//     OC_BuyerID?: string;
//     OC_ContactNumber?: string;
//     OC_DeliverAddress?: string;
//     OC_DeliverTo?: string;
//     OC_OrderAt?: Timestamp | string | null;
//     OC_PaymentMethod?: string;
//     OC_Products?: {
//       OC_ProductID?: string;
//       OC_ProductName?: string;
//       OC_ProductPrice?: string;
//       OC_ProductQuantity?: number;
//       OC_ShippingFee?: number;
//     };
//     OC_SellerFullName?: string;
//     OC_SellerID?: string;
//     OC_TotalPrice?: number;
//   }

const totalOrder = async(id: string)=>{
    try{
        const orderRef = collection(db, "Orders");
        const totalOrderQuery = query(orderRef, where("OC_SellerID", "==", id))
        const totalOrderSnapshot = await getDocs(totalOrderQuery);

        const totalOrders = totalOrderSnapshot.docs.map((doc)=>({
            id:doc.id,
            ...doc.data(),
        }))
        console.log("Successfully Fetched the Total Orders", totalOrders)
        return totalOrders
    }catch(error){
        console.error("Error Fetching on Total Order", error)
        return []
    }
}




export {totalOrder}