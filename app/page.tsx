import CalendarPage from "@/components/CalendarPage";

// カレンダーは「今日」をサーバー側で正しく計算するためリクエスト毎にレンダリング
export const dynamic = "force-dynamic";

export default function Home() {
  return <CalendarPage />;
}
