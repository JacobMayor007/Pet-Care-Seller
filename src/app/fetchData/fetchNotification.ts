import { collection, query, where, onSnapshot, getDocs, updateDoc, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);

interface Notification {
    id?: string;
    createdAt?: string;
    productID?: string;
    message?: string;
    sender?: string;
    receiver?: string;
    status?: string;
    open?: boolean;
    title?: string;
    type?: string;
    hide?: boolean;
  }

const notifications = (sellerUID: string, callback: (notifications: Notification[]) => void) => {
  if (!sellerUID) {
    console.log("No Seller UID found.");
    return () => {}; 
  }else{
    console.log("Backend: ", sellerUID);
    
  }

  const notificationsRef = collection(db, "notifications");
  const q = query(notificationsRef, where("receiverID", "==", sellerUID));

  // Real-time listener
  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const myNotif: Notification[] = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data?.createdAt
          ? dayjs(data.createdAt.toDate()).fromNow() // Convert timestamp to "time ago"
          : "Unknown time",
      };
    });

    callback(myNotif); // Send data to frontend
  });

  return unsubscribe; // Return unsubscribe function
};

const unopenNotification = (sellerUID: string, callback: (notifications: Notification[]) => void) => {
  if (!sellerUID) {
      console.log("No doctor UID found.");
      return () => {}; 
    }
    
    console.log("Backend Notif: ", sellerUID);
    
    
    const notificationsRef = collection(db, "notifications");
    const q = query(notificationsRef, where("receiverID", "==", sellerUID), where("open", "==", false));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const myNotif: Notification[] = querySnapshot.docs.map((doc)=>({
          id:doc.id,
          ...doc.data(),
      }))
  
      callback(myNotif); // Send data to frontend
    });
    console.log(unsubscribe);
    return unsubscribe;
    
  };

  const openNotification = async (sellerUID:string) =>{      
    console.log(sellerUID);
    

    try{
        const collectionRef = collection(db, "notifications")
        const q = query(collectionRef, where("open", "!=", null), where("receiverID", "==", sellerUID))
        const querySnapshot = await getDocs(q);

        const updated = querySnapshot.docs.map( async (doc)=>{
          const docRef = doc.ref

           await updateDoc(docRef, {
            ["open"]: true,
          });
        });

      console.log(updated);
      
      return updated;

    }catch(error){
        console.log(error);
        return []
    }
}

const readNotification = async (notification_UID: string) =>{      
  try{
    const docRef = doc(db, "notifications", notification_UID);

    const read = await getDoc(docRef)
    if (read.exists()) {
      // Define the update logic
      const update = {
        status: "read", // Update the status field to "read"
      };
  
      // Apply the update to the document
      const read = await updateDoc(docRef, update);
      console.log(read);
      
      return read;

    } else {
      console.log("Document does not exist");
    }
  } catch (error) {
    console.error("Error updating document: ", error);
  }
}

const hideNotification = async (notification_UID: string) =>{
try{
  const docRef = doc(db, "notifications", notification_UID);
  const docSnap = await getDoc(docRef);

  if(docSnap.exists()){
    const update = {
      hide: true,
    }

    const updated = await updateDoc(docRef, update);
    return updated;
  }
}catch(error){
  console.error(error);
  
}
}

export { notifications, unopenNotification, openNotification, hideNotification, readNotification };
