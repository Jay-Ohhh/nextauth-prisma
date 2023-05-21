"use client";

import { signIn } from "next-auth/react";
import { ChangeEvent, useState } from "react";
import { env } from "@/env/client.mjs";

export const RegisterForm = () => {
    const [loading, setLoading] = useState(false);
    const [formValues, setFormValues] = useState({
        name: "",
        email: "",
        password: "",
    });
    const [error, setError] = useState("");

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setFormValues({ name: "", email: "", password: "" });

        const JSEncrypt = (await import("jsencrypt")).default;
        const encrypt = new JSEncrypt();
        encrypt.setPublicKey(env.NEXT_PUBLIC_RSA_PUBLIC_KEY);
        const encrypted = encrypt.encrypt(formValues.password) as string;

        try {
            await fetch("/api/register", {
                method: "POST",
                body: JSON.stringify({
                    ...formValues,
                    password: encrypted
                }),
                headers: {
                    "Content-Type": "application/json",
                },
            });

            await signIn("credentials", {
                email: formValues.email,
                password: encrypted,
                callbackUrl: "/profile",
            });


            // 当使用signIn(undefined)方法启动默认身份验证提供程序的登录流程时，next-auth将自动重定向到默认的登录页面（可通过 pages 配置）
            // signIn(undefined, { callbackUrl: "/" });
        } catch (error: any) {
            setLoading(false);
            setError(String(error));
        }
    };

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setFormValues({ ...formValues, [name]: value });
    };

    const input_style =
        "form-control block w-full px-4 py-5 text-sm font-normal text-gray-700 bg-white bg-clip-padding border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-blue-600 focus:outline-none";

    return (
        <form onSubmit={onSubmit}>
            {error && (
                <p className="text-center bg-red-300 py-4 mb-6 rounded">{error}</p>
            )}
            <div className="mb-6">
                <input
                    required
                    type="name"
                    name="name"
                    value={formValues.name}
                    onChange={handleChange}
                    placeholder="Name"
                    className={`${input_style}`}
                />
            </div>
            <div className="mb-6">
                <input
                    required
                    type="email"
                    name="email"
                    value={formValues.email}
                    onChange={handleChange}
                    placeholder="Email address"
                    className={`${input_style}`}
                />
            </div>
            <div className="mb-6">
                <input
                    required
                    type="password"
                    name="password"
                    value={formValues.password}
                    onChange={handleChange}
                    placeholder="Password"
                    className={`${input_style}`}
                />
            </div>
            <button
                type="submit"
                style={{ backgroundColor: `${loading ? "#ccc" : "#3446eb"}` }}
                className="inline-block px-7 py-4 bg-blue-600 text-white font-medium text-sm leading-snug uppercase rounded shadow-md hover:bg-blue-700 hover:shadow-lg focus:bg-blue-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-blue-800 active:shadow-lg transition duration-150 ease-in-out w-full"
                disabled={loading}
            >
                {loading ? "loading..." : "Sign Up"}
            </button>
        </form>
    );
};
