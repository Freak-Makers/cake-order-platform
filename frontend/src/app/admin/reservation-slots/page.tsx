"use client";

import { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { ChevronLeft, ChevronRight, Plus, Trash2, Wand2, X } from "lucide-react";
import { createSlot, deleteSlot, getAdminSlots } from "@/api/reservation.api";
import { ReservationSlot } from "@/api/types";

const WEEKDAY_LABELS = ["월", "화", "수", "목", "금", "토", "일"];
const CAL_HEADER = ["일", "월", "화", "수", "목", "금", "토"];

// JS Date.getDay() 0=일,1=월,...,6=토 → 폼 인덱스(월=0...일=6) 로 변환
function jsDayToIdx(jsDay: number): number {
  return (jsDay + 6) % 7;
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

function formatYmd(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function splitDateTime(startAt: string): { date: string; time: string } {
  const d = new Date(startAt);
  return {
    date: formatYmd(d),
    time: `${pad2(d.getHours())}:${pad2(d.getMinutes())}`,
  };
}

function enumerateDates(startStr: string, endStr: string, weekdayFlags: boolean[]): Date[] {
  if (!startStr || !endStr) return [];
  const start = new Date(startStr);
  const end = new Date(endStr);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return [];
  if (start > end) return [];

  const out: Date[] = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    const idx = jsDayToIdx(cursor.getDay());
    if (weekdayFlags[idx]) {
      out.push(new Date(cursor));
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return out;
}

function parseHM(hm: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hm);
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h < 0 || h > 23 || min < 0 || min > 59) return null;
  return h * 60 + min;
}

function fillTimes(startHM: string, endHM: string, intervalMin: number): string[] {
  const startMin = parseHM(startHM);
  const endMin = parseHM(endHM);
  if (startMin == null || endMin == null) return [];
  if (intervalMin <= 0) return [];
  if (endMin <= startMin) return [];

  const out: string[] = [];
  for (let m = startMin; m < endMin; m += intervalMin) {
    out.push(`${pad2(Math.floor(m / 60))}:${pad2(m % 60)}`);
  }
  return out;
}

function startOfMonth(d: Date): Date {
  const x = new Date(d);
  x.setDate(1);
  x.setHours(0, 0, 0, 0);
  return x;
}

function addMonths(d: Date, n: number): Date {
  const x = new Date(d);
  x.setMonth(x.getMonth() + n);
  return x;
}

// 6주 × 7일 grid (일요일 시작). 이전/다음 달 날짜로 채움.
function getMonthMatrix(viewMonth: Date): Date[][] {
  const first = startOfMonth(viewMonth);
  const gridStart = new Date(first);
  gridStart.setDate(first.getDate() - first.getDay()); // 일요일까지 거슬러 올라감

  const weeks: Date[][] = [];
  const cursor = new Date(gridStart);
  for (let w = 0; w < 6; w++) {
    const week: Date[] = [];
    for (let d = 0; d < 7; d++) {
      week.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }
  return weeks;
}

const INTERVAL_OPTIONS = [15, 30, 60, 90, 120];

export default function AdminReservationSlotsPage() {
  const [slots, setSlots] = useState<ReservationSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 폼 상태 (기간/요일/시간) — 기존 그대로
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [weekdays, setWeekdays] = useState<boolean[]>([true, true, true, true, true, true, true]);
  const [fillStart, setFillStart] = useState("10:00");
  const [fillEnd, setFillEnd] = useState("18:00");
  const [fillInterval, setFillInterval] = useState(60);
  const [times, setTimes] = useState<string[]>([""]);

  // 달력 뷰 상태
  const [viewMonth, setViewMonth] = useState<Date>(() => startOfMonth(new Date()));
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const fetchSlots = async () => {
    try {
      setSlots(await getAdminSlots());
    } catch (e) {
      console.error("Failed to fetch slots:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, []);

  // === 폼 핸들러 ===
  const handleAddTime = () => setTimes((prev) => [...prev, ""]);
  const handleRemoveTime = (idx: number) =>
    setTimes((prev) => (prev.length === 1 ? [""] : prev.filter((_, i) => i !== idx)));
  const handleTimeChange = (idx: number, value: string) =>
    setTimes((prev) => prev.map((t, i) => (i === idx ? value : t)));

  const handleFillTimes = () => {
    const filled = fillTimes(fillStart, fillEnd, fillInterval);
    if (filled.length === 0) {
      setError("자동 채우기 입력을 확인하세요 (시작 < 종료, 간격 > 0).");
      return;
    }
    setError(null);
    setTimes(filled);
  };

  const setAllWeekdays = (value: boolean) => setWeekdays(Array(7).fill(value));
  const setWeekdaysOnly = () => setWeekdays([true, true, true, true, true, false, false]);
  const setWeekendOnly = () => setWeekdays([false, false, false, false, false, true, true]);
  const toggleWeekday = (idx: number) =>
    setWeekdays((prev) => prev.map((v, i) => (i === idx ? !v : v)));

  const previewCount = useMemo(() => {
    const dates = enumerateDates(startDate, endDate, weekdays);
    const cleanTimes = times.map((t) => t.trim()).filter(Boolean);
    return dates.length * cleanTimes.length;
  }, [startDate, endDate, weekdays, times]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const dates = enumerateDates(startDate, endDate, weekdays);
    const cleanTimes = Array.from(new Set(times.map((t) => t.trim()).filter(Boolean)));

    if (!startDate || !endDate) return setError("기간을 선택하세요.");
    if (new Date(startDate) > new Date(endDate)) return setError("시작일이 종료일보다 늦습니다.");
    if (dates.length === 0) return setError("선택한 요일에 해당하는 날짜가 없습니다.");
    if (cleanTimes.length === 0) return setError("시간을 하나 이상 입력하세요.");

    setIsSubmitting(true);
    let createdTotal = 0;
    const attemptedTotal = dates.length * cleanTimes.length;
    try {
      for (const d of dates) {
        const created = await createSlot({ date: formatYmd(d), times: cleanTimes });
        createdTotal += created.length;
      }
      const skipped = attemptedTotal - createdTotal;
      alert(
        `${createdTotal}개 슬롯 생성 (요청 ${attemptedTotal}개 중 ${skipped}개는 중복으로 skip)`
      );
      setTimes([""]);
      await fetchSlots();
    } catch (err) {
      console.error("Failed to create slots:", err);
      setError("슬롯 생성 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("해당 슬롯을 삭제하시겠습니까?")) return;
    try {
      await deleteSlot(id);
      await fetchSlots();
    } catch (e) {
      console.error("Failed to delete slot:", e);
    }
  };

  // === 달력 데이터 ===
  const slotsByDate = useMemo(() => {
    const map: Record<string, ReservationSlot[]> = {};
    slots.forEach((s) => {
      const { date } = splitDateTime(s.startAt);
      (map[date] ??= []).push(s);
    });
    Object.values(map).forEach((arr) =>
      arr.sort((a, b) => a.startAt.localeCompare(b.startAt))
    );
    return map;
  }, [slots]);

  const monthMatrix = useMemo(() => getMonthMatrix(viewMonth), [viewMonth]);
  const todayYmd = formatYmd(new Date());
  const slotsForSelected = selectedDate ? slotsByDate[selectedDate] ?? [] : [];

  const handlePrevMonth = () => setViewMonth((d) => addMonths(d, -1));
  const handleNextMonth = () => setViewMonth((d) => addMonths(d, 1));
  const handleToday = () => {
    const today = new Date();
    setViewMonth(startOfMonth(today));
    setSelectedDate(formatYmd(today));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 sm:space-y-8">
        <div>
          <h1 className="text-xl font-bold text-zinc-900 sm:text-2xl">예약 가능 슬롯 관리</h1>
          <p className="mt-1 text-sm text-zinc-500">
            기간·요일·시간을 골라 한 번에 여러 슬롯을 만들 수 있습니다. 중복된 시간은 자동으로 건너뜁니다.
          </p>
        </div>

        {/* 등록 폼 */}
        <Card>
          <CardContent className="p-4 sm:p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <section className="space-y-2">
                <h2 className="text-sm font-bold text-zinc-900">1. 예약 가능 기간</h2>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-pink-500 focus:outline-none"
                  />
                  <span className="text-zinc-400">~</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-pink-500 focus:outline-none"
                  />
                </div>
              </section>

              <section className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-sm font-bold text-zinc-900">2. 요일</h2>
                  <div className="flex gap-1 text-xs">
                    <button type="button" onClick={() => setAllWeekdays(true)} className="rounded-md border border-zinc-200 px-2 py-1 text-zinc-600 hover:bg-zinc-50">전체</button>
                    <button type="button" onClick={setWeekdaysOnly} className="rounded-md border border-zinc-200 px-2 py-1 text-zinc-600 hover:bg-zinc-50">평일</button>
                    <button type="button" onClick={setWeekendOnly} className="rounded-md border border-zinc-200 px-2 py-1 text-zinc-600 hover:bg-zinc-50">주말</button>
                    <button type="button" onClick={() => setAllWeekdays(false)} className="rounded-md border border-zinc-200 px-2 py-1 text-zinc-600 hover:bg-zinc-50">해제</button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  {WEEKDAY_LABELS.map((label, idx) => {
                    const active = weekdays[idx];
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => toggleWeekday(idx)}
                        className={
                          "h-10 w-10 rounded-full border text-sm font-bold transition " +
                          (active
                            ? "border-pink-500 bg-pink-50 text-pink-600"
                            : "border-zinc-200 bg-white text-zinc-400 hover:bg-zinc-50")
                        }
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="space-y-3">
                <h2 className="text-sm font-bold text-zinc-900">3. 시간</h2>

                <div className="flex flex-wrap items-end gap-2 rounded-lg border border-dashed border-zinc-200 bg-zinc-50/60 p-3">
                  <div>
                    <label className="mb-1 block text-xs text-zinc-500">시작 시각</label>
                    <input type="time" value={fillStart} onChange={(e) => setFillStart(e.target.value)} className="rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-pink-500 focus:outline-none" />
                  </div>
                  <span className="pb-2 text-zinc-400">~</span>
                  <div>
                    <label className="mb-1 block text-xs text-zinc-500">종료 시각</label>
                    <input type="time" value={fillEnd} onChange={(e) => setFillEnd(e.target.value)} className="rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-pink-500 focus:outline-none" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-zinc-500">간격</label>
                    <select value={fillInterval} onChange={(e) => setFillInterval(Number(e.target.value))} className="rounded-lg border border-zinc-200 px-3 py-2 text-sm focus:border-pink-500 focus:outline-none">
                      {INTERVAL_OPTIONS.map((m) => (
                        <option key={m} value={m}>{m}분</option>
                      ))}
                    </select>
                  </div>
                  <Button type="button" variant="outline" onClick={handleFillTimes} className="gap-1">
                    <Wand2 size={14} />
                    채우기
                  </Button>
                </div>

                <div>
                  <p className="mb-1 text-xs text-zinc-500">선택된 시간 ({times.filter((t) => t.trim()).length}개)</p>
                  <ul className="flex flex-wrap gap-2">
                    {times.map((t, idx) => (
                      <li key={idx} className="flex items-center gap-1 rounded-lg border border-zinc-200 bg-white px-2 py-1">
                        <input type="time" value={t} onChange={(e) => handleTimeChange(idx, e.target.value)} className="w-24 border-0 bg-transparent text-sm focus:outline-none" />
                        <button type="button" onClick={() => handleRemoveTime(idx)} className="rounded p-0.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600" aria-label="시간 제거">
                          <X size={14} />
                        </button>
                      </li>
                    ))}
                    <li>
                      <button type="button" onClick={handleAddTime} className="flex h-full items-center gap-1 rounded-lg border border-dashed border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-500 hover:bg-zinc-50">
                        <Plus size={14} /> 추가
                      </button>
                    </li>
                  </ul>
                </div>
              </section>

              <div className="flex items-center justify-between gap-3 border-t border-zinc-100 pt-4">
                <p className="text-sm text-zinc-500">
                  예상 생성 슬롯: <span className="font-bold text-zinc-900">{previewCount}</span>개
                  <span className="text-xs text-zinc-400"> (중복은 자동 skip)</span>
                </p>
                <Button type="submit" disabled={isSubmitting || previewCount === 0} className="bg-pink-500 hover:bg-pink-600">
                  {isSubmitting ? "등록 중..." : "등록"}
                </Button>
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>
              )}
            </form>
          </CardContent>
        </Card>

        {/* 달력 뷰 */}
        <div className="space-y-3">
          <h2 className="text-lg font-bold">등록된 슬롯</h2>

          <Card>
            <CardContent className="p-3 sm:p-6">
              {/* 월 네비게이션 */}
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handlePrevMonth}
                    className="rounded-md p-2 text-zinc-500 hover:bg-zinc-100"
                    aria-label="이전 달"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <h3 className="px-2 text-base font-bold text-zinc-900">
                    {viewMonth.getFullYear()}년 {viewMonth.getMonth() + 1}월
                  </h3>
                  <button
                    type="button"
                    onClick={handleNextMonth}
                    className="rounded-md p-2 text-zinc-500 hover:bg-zinc-100"
                    aria-label="다음 달"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
                <Button size="sm" variant="outline" onClick={handleToday}>
                  오늘
                </Button>
              </div>

              {/* 요일 헤더 */}
              <div className="grid grid-cols-7 border-b border-zinc-100 pb-2 text-center text-xs font-medium text-zinc-400">
                {CAL_HEADER.map((label, i) => (
                  <div
                    key={label}
                    className={i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : ""}
                  >
                    {label}
                  </div>
                ))}
              </div>

              {/* 날짜 grid */}
              <div className="mt-2 grid grid-cols-7 gap-1">
                {monthMatrix.flat().map((d) => {
                  const ymd = formatYmd(d);
                  const inMonth = d.getMonth() === viewMonth.getMonth();
                  const isToday = ymd === todayYmd;
                  const isSelected = ymd === selectedDate;
                  const count = slotsByDate[ymd]?.length ?? 0;
                  const weekday = d.getDay();

                  return (
                    <button
                      key={ymd + (inMonth ? "" : "-out")}
                      type="button"
                      onClick={() => setSelectedDate(ymd)}
                      className={
                        "relative flex aspect-square flex-col items-center justify-start gap-0.5 rounded-md border p-1 text-xs transition sm:p-1.5 " +
                        (isSelected
                          ? "border-pink-500 bg-pink-50"
                          : "border-transparent hover:bg-zinc-50") +
                        (inMonth ? " " : " opacity-40")
                      }
                    >
                      <span
                        className={
                          "leading-none " +
                          (isToday ? "font-bold text-blue-600" : "") +
                          (!isToday && weekday === 0 ? " text-red-500" : "") +
                          (!isToday && weekday === 6 ? " text-blue-500" : "") +
                          (!isToday && weekday !== 0 && weekday !== 6 ? " text-zinc-700" : "")
                        }
                      >
                        {d.getDate()}
                      </span>
                      {count > 0 && (
                        <>
                          <span className="mt-auto inline-block h-1.5 w-1.5 rounded-full bg-pink-500" />
                          <span className="text-[10px] font-bold text-pink-600">{count}</span>
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* 선택 날짜 영역 */}
          <Card>
            <CardContent className="p-4 sm:p-6">
              {isLoading ? (
                <p className="text-zinc-500">불러오는 중...</p>
              ) : !selectedDate ? (
                <p className="text-sm text-zinc-400">달력에서 날짜를 선택하면 등록된 시간대를 볼 수 있습니다.</p>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-zinc-900">
                      {selectedDate}{" "}
                      <span className="text-xs font-medium text-zinc-500">
                        ({slotsForSelected.length}개)
                      </span>
                    </p>
                  </div>
                  {slotsForSelected.length === 0 ? (
                    <p className="text-sm text-zinc-400">이 날짜에 등록된 슬롯이 없습니다.</p>
                  ) : (
                    <ul className="flex flex-wrap gap-2">
                      {slotsForSelected.map((s) => {
                        const { time } = splitDateTime(s.startAt);
                        return (
                          <li
                            key={s.id}
                            className="flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700"
                          >
                            {time}
                            <button
                              onClick={() => handleDelete(s.id)}
                              className="text-zinc-400 hover:text-red-500"
                              aria-label="삭제"
                            >
                              <Trash2 size={12} />
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
