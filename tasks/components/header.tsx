import { Wand } from "lucide-react"

export default function Header() {
    return (
      <div className="container flex flex-col items-center px-4 md:px-4">
        <div className="flex justify-start w-full">
          <div className="w-1/7 overflow-visible">
            <img
              src="/HMCTS_logo.png"
              alt="HMCTS logo"
            />
          </div>
        </div>
        <div className="flex items-center justify-center font-bold text-4xl text-blue-600">
          TaskFlow
        </div>
      </div>
    );
}