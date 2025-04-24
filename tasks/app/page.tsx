"use client"
import React from "react"
import Header  from "../components/header"
import TaskList from "../components/taskList"
import "./globals.css"
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


export default function Home() {

  return (
    <>
    <Header />
    <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    <TaskList />
    </>

  )
}
