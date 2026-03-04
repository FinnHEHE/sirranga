import {
  Gamepad2,
  Calculator,
  Music,
  Camera,
  MessageSquare,
  Paintbrush,
} from "lucide-react"
import { PageTransition } from "@/components/page-transition"
import { BackButton } from "@/components/back-button"
import { AppCard } from "@/components/app-card"

const apps = [
  {
    title: "GameZone",
    description: "A fun collection of mini games",
    icon: <Gamepad2 className="h-12 w-12" />,
  },
  {
    title: "QuickCalc",
    description: "Lightning-fast calculator app",
    icon: <Calculator className="h-12 w-12" />,
  },
  {
    title: "BeatMaker",
    description: "Create sick beats on the go",
    icon: <Music className="h-12 w-12" />,
  },
  {
    title: "SnapEdit",
    description: "Easy photo editing tools",
    icon: <Camera className="h-12 w-12" />,
  },
  {
    title: "ChatBuddy",
    description: "Talk to an AI companion",
    icon: <MessageSquare className="h-12 w-12" />,
  },
  {
    title: "DrawPad",
    description: "Digital drawing canvas",
    icon: <Paintbrush className="h-12 w-12" />,
  },
]

export default function AppsPage() {
  return (
    <PageTransition>
      <main className="min-h-screen px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10">
            <BackButton />
          </div>

          <h1 className="text-4xl md:text-5xl font-sans text-orange mb-12">
            Apps
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {apps.map((app) => (
              <AppCard
                key={app.title}
                title={app.title}
                description={app.description}
                icon={app.icon}
              />
            ))}
          </div>
        </div>
      </main>
    </PageTransition>
  )
}
