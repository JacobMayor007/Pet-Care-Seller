import fetchUserData from "@/app/fetchData/fetchUserData";
import { db } from "@/app/firebase/config"
import { addDoc, collection, doc, getDoc, Timestamp, updateDoc } from "firebase/firestore"

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
    OC_TotalPrice?: number;
  }

const fetchOrder = async (orderID: string): Promise <Order | null> =>{
   try{
    const docRef = doc(db, "Orders", orderID);
    const docSnap = await getDoc(docRef);

   
    return {id:docSnap.id , ...docSnap.data() as Order};
    

   }catch(error){
    console.error(error);
    return null ;
   }
}

const shippedProduct = async (orderID: string, sellerUID: string, buyerUID: string, item:string) => { 
  const data = await fetchUserData();
  const displayName = data[0]?.User_Name;

  try{
    console.log("Backend Order ID shipped: ", orderID);

    const docRef = doc(db, "Orders", orderID);
    const docSnap = await getDoc(docRef);

    if(docSnap.exists()){
      const notifRef = collection(db, "notifications");
      const added = await addDoc(notifRef, {
        createdAt: Timestamp.now(),
        hide: false,
        item: item,
        message: `${displayName} has shipped your product`,
        open:false,
        order_ID: orderID,
        receiverID: buyerUID,
        senderID: sellerUID,
        status: "unread",
        title: `Shipping ${displayName} product`
      });
      console.log(added);
      

      const updated = updateDoc(docRef,{
        OC_Status: "shipped",
      });      
      return updated;
    }

  }catch(err){
    console.error(err);
  }
}

const paidProduct  = async (orderID:string, senderID:string, receiverID:string, item: string) =>{
  const data = await fetchUserData();
  const displayName = data[0]?.User_Name;

  try{
    const docRef = doc(db, "Orders", orderID);
    const docSnap = await getDoc(docRef);

    if(docSnap.exists()){

      const notifRef = collection(db, "notifications");
      const addNotifPaidProduct = await addDoc(notifRef,{
        createdAt: Timestamp.now(),
        hide: false,
        item: item,
        message: `${displayName} has received your payment, please rate ${displayName} product`,
        open:false,
        order_ID: orderID,
        receiverID: receiverID,
        senderID: senderID,
        status: "unread",
        title: `Shipping ${displayName} product`
      })

      console.log(addNotifPaidProduct);
      
      const updated = await updateDoc(docRef,{
        OC_Status: "paid",
      })
      return updated
    }

  }catch(error){
    console.error(error);
  }

}

export {fetchOrder, shippedProduct, paidProduct}

