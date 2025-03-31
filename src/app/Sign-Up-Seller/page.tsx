"use client";
import { auth, provider } from "@/app/firebase/config";
import { FacebookOutlined, GoogleOutlined } from "@ant-design/icons";
import { FacebookAuthProvider, getAuth, signInWithPopup } from "firebase/auth";
import { doc, getFirestore, setDoc, Timestamp } from "firebase/firestore";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCreateUserWithEmailAndPassword } from "react-firebase-hooks/auth";
import RegisterAs from "../RegisterAs/page";

export default function RegisterAsProvider() {
  const [show, setShow] = useState(false);
  const [confirmShow, setConfirmShow] = useState(false);
  const [usingAuth, setUsingAuth] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkBox, setCheckBox] = useState(false);
  const [formData, setFormData] = useState({
    fName: "",
    lName: "",
    email: "",
    confirmPassword: "",
    password: "",
    pickupAddress: "",
    contact: "",
    standardDelivery: false,
    businessName: "",
  });
  const router = useRouter();

  const [createUserWithEmailAndPassword, loading] =
    useCreateUserWithEmailAndPassword(auth);
  const db = getFirestore();

  const handleSignUp = async () => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (isSubmitting) return;

    setIsSubmitting(true);

    // Basic Validation
    if (
      !formData.fName ||
      !formData.lName ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword ||
      !formData.pickupAddress ||
      !formData.businessName ||
      !formData.contact ||
      !formData.pickupAddress ||
      !formData.standardDelivery
    ) {
      alert("All fields are required.");
      setIsSubmitting(false); // Re-enable the button
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      setIsSubmitting(false); // Re-enable the button
      return;
    }

    if (!regex.test(formData.password)) {
      alert(
        "Please input atleast one uppercase, lowercase, and one special character, and number!"
      );
    }

    if (!checkBox) {
      alert("Please check the terms and conditions");
      return;
    }

    try {
      // Create user with Firebase Authentication
      const res = await createUserWithEmailAndPassword(
        formData.email,
        formData.password
      );
      if (!res || !res.user) {
        throw new Error("Failed to create user. Please try again.");
      }

      // Add user data to Firestore
      const userRef = doc(db, "Users", res.user.uid);
      await setDoc(userRef, {
        User_Name: formData.fName + formData.lName,
        User_Email: formData.email,
        User_UID: res.user.uid,
        TermsAndConditions: checkBox,
        CreatedAt: Timestamp.now(),
      });
      const sellerRef = doc(db, "seller", res.user.uid);
      await setDoc(sellerRef, {
        seller_fullName: formData.fName + formData.lName,
        seller_email: formData.email,
        seller_uid: res.user.uid,
        seller_info: {
          pickup_address: formData.pickupAddress,
          standard_delivery: formData.standardDelivery,
          business_name: formData.businessName,
          contact: formData.contact,
        },
        createdAt: Timestamp.now(),
      });

      // Clear input fields
      setFormData({
        fName: "",
        lName: "",
        email: "",
        confirmPassword: "",
        password: "",
        pickupAddress: "",
        contact: "",
        standardDelivery: false,
        businessName: "",
      });

      router.push("/");
    } catch (error) {
      console.error("Error during sign-up:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const googleAuth = async () => {
    try {
      if (
        !formData.pickupAddress ||
        !formData.businessName ||
        !formData.contact ||
        !formData.pickupAddress ||
        !formData.standardDelivery
      ) {
        alert("Please input all requirement fields");
        setUsingAuth(true);
        return new Error("Please input all requirement fields");
      }

      const result = await signInWithPopup(auth, provider);
      console.log(result.providerId);

      const userRef = doc(db, "Users", result.user.uid);
      await setDoc(userRef, {
        User_Name: result.user.displayName,
        User_Email: result.user.email,
        User_UID: result.user.uid,
        CreatedAt: Timestamp.now(),
      });
      const sellerRef = doc(db, "seller", result.user.uid);
      await setDoc(sellerRef, {
        seller_fullName: result.user.displayName,
        seller_email: result.user.email,
        seller_uid: result.user.uid,
        seller_info: {
          pickup_address: formData.pickupAddress,
          standard_delivery: formData.standardDelivery,
          business_name: formData.businessName,
          contact: formData.contact,
        },
        createdAt: Timestamp.now(),
      });
      if (result) {
        router.push("/");
      } else {
        router.push("/Sign-Up-Seller");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const facebookAuth = async () => {
    try {
      if (
        !formData.pickupAddress ||
        !formData.businessName ||
        !formData.contact ||
        !formData.pickupAddress ||
        !formData.standardDelivery
      ) {
        alert("Please input all requirement fields");
        setUsingAuth(true);

        return new Error("Please input all requirement fields");
      }
      const result = await signInWithPopup(
        getAuth(),
        new FacebookAuthProvider()
      );
      const userRef = doc(db, "Users", result.user.uid);
      await setDoc(userRef, {
        User_Name: result.user.displayName,
        User_Email: result.user.email,
        User_UID: result.user.uid,
        CreatedAt: Timestamp.now(),
      });
      const sellerRef = doc(db, "seller", result.user.uid);
      await setDoc(sellerRef, {
        seller_fullName: result.user.displayName,
        seller_email: result.user.email,
        seller_uid: result.user.uid,
        seller_info: {
          pickup_address: formData.pickupAddress,
          standard_delivery: formData.standardDelivery,
          business_name: formData.businessName,
          contact: formData.contact,
        },
        createdAt: Timestamp.now(),
      });
      if (result) {
        router.push("/");
      } else {
        router.push("/Sign-Up-Seller");
      }
      console.log("Facebook Sign In", result);
    } catch (err) {
      console.log(err);
    }
  };

  console.log("Value of Checkbox: ", checkBox);
  console.log("Type Of Delivery: ", formData.standardDelivery);

  return (
    <div className="bg-[#9FE1DB] bg-signUp h-screen">
      <div className="xl:h-full 2xl:h-screen flex flex-row">
        <div className="w-[30%]">
          <h1 className="text-5xl font-sigmar font-normal text-white mt-20 text-center">
            Pet Care Pro
          </h1>
          <Image
            src="/Logo.svg"
            width={626}
            height={650}
            alt="Logo Icon"
            className="object-contain mt-8"
          />
        </div>
        <div className="w-[70%] rounded-[25px_0px_0px_25px] z-[2] bg-white flex flex-col px-20 gap-7">
          <div className="mt-14 flex flex-row items-center justify-between gap-2">
            <div className="flex flex-row items-center gap-2">
              <Image
                src="/PawPrint.svg"
                height={50}
                width={50}
                alt="Paw Print Icon"
              />
              <h1 className="text-3xl font-montserrat font-bold">
                Seller Registration
              </h1>
            </div>
            <RegisterAs />
          </div>
          <form
            className="flex flex-col gap-7 z-10"
            onSubmit={(e) => {
              e.preventDefault();
              handleSignUp();
            }}
          >
            <div className="grid grid-cols-2 gap-10">
              <div className={!usingAuth ? `relative` : `hidden`}>
                <label
                  className="absolute left-7 -top-2 bg-white text-sm font-hind w-fit text-nowrap"
                  htmlFor="fName"
                >
                  First Name{" "}
                  <span className="text-red-500 text-sm font-montserrat ">
                    *
                  </span>
                </label>
                <input
                  type="text"
                  name="first-name"
                  id="fName"
                  className="h-12 w-full border-[1px] border-solid border-black outline-none rounded-md text-base font-hind px-2"
                  value={formData.fName}
                  onChange={(e) =>
                    setFormData({ ...formData, fName: e.target.value })
                  }
                />
              </div>
              <div className={!usingAuth ? `relative` : `hidden`}>
                <label
                  className="absolute left-7 -top-2  bg-white text-sm  font-hind"
                  htmlFor="lName"
                >
                  Last Name
                  <span className="text-red-500 text-sm font-montserrat ">
                    *
                  </span>
                </label>
                <input
                  type="text"
                  name="last name"
                  id="lName"
                  className="h-12 w-full border-[1px] border-solid border-black outline-none rounded-md text-base font-hind px-2"
                  value={formData.lName}
                  onChange={(e) =>
                    setFormData({ ...formData, lName: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-7 gap-10">
              <div className="relative col-span-5">
                <label
                  htmlFor="clinic"
                  className="absolute left-7 -top-2  bg-white text-sm  font-hind"
                >
                  Pick-Up Address
                  <span className="text-red-500 text-sm font-montserrat ">
                    *
                  </span>
                </label>
                <input
                  type={`text`}
                  name="business"
                  id="business-address"
                  className="h-12 w-full border-[1px] border-solid border-black outline-none rounded-md font-hind text base px-2"
                  value={formData.pickupAddress}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pickupAddress: e.target.value,
                    })
                  }
                />
              </div>
              <div className="relative ">
                <label
                  htmlFor="business-name"
                  className="absolute left-7 -top-2  bg-white text-sm text-nowrap font-hind"
                >
                  Business Name
                  <span className="text-red-500 text-sm font-montserrat ">
                    *
                  </span>
                </label>
                <input
                  type={`text`}
                  name="businessName"
                  id="business-name"
                  className="h-12 border-[1px] border-solid border-black outline-none rounded-md font-hind text base px-2"
                  value={formData.businessName}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      businessName: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-10">
              <div className={!usingAuth ? `relative` : `hidden`}>
                <label
                  className="absolute left-7 -top-2  bg-white text-sm  font-hind"
                  htmlFor="email-address"
                >
                  Email Address
                  <span className="text-red-500 text-sm font-montserrat ">
                    *
                  </span>
                </label>
                <input
                  type="text"
                  name="emailAdd"
                  id="email-address"
                  className="h-12 w-full border-[1px] border-solid border-black outline-none rounded-md text-base font-hind px-2"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
              <div className="relative border-solid border-black rounded-md border-[1px] pl-1 pr-2 flex flex-row items-center">
                <label
                  className="absolute left-7 z-20 -top-2 bg-white text-sm font-hind"
                  htmlFor="phone-number"
                >
                  Phone Number
                  <span className="text-red-500 text-sm font-montserrat ">
                    *
                  </span>
                </label>
                <p className="  bg-white py-1 px-1 font-montserrat font-medium drop-shadow-md rounded-md">
                  +63
                </p>
                <input
                  type="number"
                  name="Phone"
                  id="phone-number"
                  onKeyDown={(event) => {
                    if (
                      event.key == "." ||
                      event.key === "-" ||
                      event.key === "e"
                    ) {
                      event.preventDefault();
                    }
                  }}
                  className="h-12 w-full outline-none text-base font-hind px-2 [&::-webkit-inner-spin-button]:appearance-none"
                  value={formData.contact}
                  onChange={(e) =>
                    setFormData({ ...formData, contact: e.target.value })
                  }
                />
              </div>
            </div>
            <div className={!usingAuth ? `grid grid-cols-2 gap-10` : `hidden`}>
              <div className="relative">
                <label
                  htmlFor="password"
                  className="absolute left-7 -top-2 bg-white text-sm  font-hind"
                >
                  Password
                  <span className="text-red-500 text-sm font-montserrat ">
                    *
                  </span>
                </label>
                <input
                  type={show ? `text` : `password`}
                  name="password"
                  id="password"
                  className="h-12 w-full border-[1px] border-solid border-black outline-none rounded-md font-hind text base px-2"
                  value={formData.password}
                  minLength={8}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
                <div className="absolute right-3 bottom-4">
                  <Image
                    src={show ? `/Eyeopen.png` : `/icon _eye close_.svg`}
                    height={33.53}
                    width={19}
                    alt="Show Password icon"
                    className="object-contain cursor-pointer"
                    draggable={false}
                    onClick={() => setShow((prev) => !prev)}
                  />
                </div>
              </div>
              <div className="relative">
                <label
                  htmlFor="confirmPassword"
                  className="absolute left-7 -top-2 bg-white text-sm font-hind"
                >
                  Confirm Password
                  <span className="text-red-500 text-sm font-montserrat ">
                    *
                  </span>
                </label>
                <input
                  type={confirmShow ? `text` : `password`}
                  name="confirm password"
                  id="confirmPassword"
                  className="h-12 w-full border-[1px] border-solid border-black outline-none rounded-md font-hind text-base px-2"
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    })
                  }
                />
                <div className="absolute right-3 bottom-4">
                  <Image
                    src={confirmShow ? `/Eyeopen.png` : `/icon _eye close_.svg`}
                    height={33.53}
                    width={19}
                    alt="Show Password icon"
                    draggable={false}
                    className="object-contain cursor-pointer"
                    onClick={() => setConfirmShow((prev) => !prev)}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-row items-center gap-3  w-fit p-2">
              <input
                type="checkbox"
                name="delivery"
                id="standard-delivery"
                checked={formData.standardDelivery}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    standardDelivery: e.target.checked,
                  })
                }
                className="cursor-pointer"
              />
              <label
                htmlFor="standard-delivery"
                className="font-hind text-[#393939] text-lg cursor-pointer"
              >
                Standard Delivery
                <span className="text-red-500 text-sm font-montserrat ml-1">
                  *
                </span>
              </label>
            </div>

            <div className="flex flex-row gap-3">
              <input
                type="checkbox"
                name="agree"
                id="agreeTandT"
                className="w-6 h-6 text-base font-hind px-2 cursor-pointer"
                checked={checkBox}
                onChange={() => setCheckBox((prev) => !prev)}
              />
              <label htmlFor="agreeTandT" className="cursor-pointer">
                I agree to the{" "}
                <span className="text-[#4ABEC5] text-base font-hind">
                  Terms
                </span>{" "}
                and{" "}
                <span className="text-[#4ABEC5] text-base font-hind">
                  Conditions
                </span>
                <span className="text-red-500 text-sm font-montserrat ml-1">
                  *
                </span>
              </label>
            </div>
            <div>
              <button
                type="submit"
                id="signup-button"
                className={`w-[200px] h-[50px] ${
                  isSubmitting
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-[#6BE8DC] hover:bg-blue-400"
                } text-[22px] font-montserrat font-bold text-white rounded-lg`}
                disabled={Boolean(isSubmitting || loading)}
              >
                {loading ? "Signing Up..." : "Sign Up"}
              </button>
            </div>
            <div className="w-[600px] h-20 grid grid-cols-3 gap-4">
              <div
                className="h-16 flex items-center drop-shadow-lg justify-center rounded-full border-[#C3C3C3] border-[1px] gap-4 cursor-pointer"
                onClick={googleAuth}
              >
                <GoogleOutlined className="text-4xl text-green-500" />
                <h1 className="text-2xl font-hind">Google</h1>
              </div>
              <div
                className="h-16 flex items-center drop-shadow-lg justify-center rounded-full border-[#C3C3C3] border-[1px] gap-4 cursor-pointer"
                onClick={facebookAuth}
              >
                <FacebookOutlined className="text-4xl text-blue-500" />
                <h1 className="text-2xl font-hind">Facebook</h1>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
