"use client"
import React from "react"
import Header  from "../components/header"
import TaskList from "../components/taskList"
import "./globals.css"


export default function Home() {
  return (
    <>
    <Header />
    <TaskList />
    </>

  )
}
