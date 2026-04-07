# Study Plan Generator
import numpy as np
from datetime import datetime, timedelta
from typing import List, Dict
from app.schemas import (
    StudyPlanRequest,
    StudyPlanResponse,
    DailyStudyPlan,
    StudyMilestone,
)
from app.config import settings
import logging

logger = logging.getLogger(__name__)


class StudyPlanGenerator:
    """
    Generate personalized study plans for exams using:
    - Time until exam
    - Current mastery per topic
    - Available study hours per day
    - Topic dependencies and prerequisites
    """

    # Time estimates to reach 90% mastery (in hours)
    MASTERY_ESTIMATES = {
        "Algebra": 15,
        "Geometry": 12,
        "Trigonometry": 10,
        "Calculus": 20,
        "Biology": 18,
        "Chemistry": 20,
        "Physics": 25,
        "World History": 14,
        "Modern History": 12,
    }

    # Topic prerequisites
    PREREQUISITES = {
        "Trigonometry": ["Algebra"],
        "Calculus": ["Trigonometry"],
        "Chemistry": ["Algebra"],
        "Physics": ["Calculus"],
        "Organic Chemistry": ["Chemistry"],
    }

    def __init__(self):
        self.plan_count = 0

    def generate(self, request: StudyPlanRequest) -> StudyPlanResponse:
        """
        Generate a study plan for exam preparation.

        Algorithm:
        1. Calculate total hours needed for each topic
        2. Determine topic order (prerequisites first)
        3. Allocate daily study blocks
        4. Create milestones for progress tracking
        5. Calculate success probability
        """
        logger.info(f"Generating study plan for user {request.userId}")

        exam_date = datetime.fromisoformat(request.examDate.replace("Z", "+00:00"))
        today = datetime.now(exam_date.tzinfo)
        days_available = (exam_date - today).days

        if days_available < 1:
            logger.error("Exam date is in the past")
            return StudyPlanResponse(
                dailyPlan=[],
                milestones=[],
                totalHoursRequired=0,
                recommendedStartDate=today.isoformat(),
                successProbability=0,
            )

        # Calculate hours needed for each topic
        hours_needed = self._calculate_hours_needed(
            request.topics,
            request.currentMastery,
        )

        total_hours = sum(hours_needed.values())
        available_hours = days_available * request.hoursPerDay

        # Order topics by prerequisites
        ordered_topics = self._order_by_prerequisites(request.topics)

        # Generate daily plan
        daily_plan = self._create_daily_plan(
            ordered_topics,
            hours_needed,
            days_available,
            request.hoursPerDay,
            today,
        )

        # Create milestones
        milestones = self._create_milestones(
            daily_plan,
            request.currentMastery,
            request.topics,
        )

        # Calculate success probability
        time_coverage = min(1.0, available_hours / total_hours)
        intensity_factor = request.hoursPerDay / 3.0  # 3 hours/day is baseline
        success_prob = time_coverage * intensity_factor * 100
        success_prob = max(20, min(99, success_prob))  # Clamp 20-99%

        self.plan_count += 1
        logger.info(
            f"Generated plan with {len(daily_plan)} days, "
            f"{total_hours:.1f} hours required, "
            f"{success_prob:.0f}% success probability "
            f"(plan #{self.plan_count})"
        )

        return StudyPlanResponse(
            dailyPlan=daily_plan,
            milestones=milestones,
            totalHoursRequired=total_hours,
            recommendedStartDate=today.isoformat(),
            successProbability=success_prob,
        )

    def _calculate_hours_needed(
        self,
        topics: List[str],
        current_mastery: Dict[str, float],
    ) -> Dict[str, float]:
        """Calculate study hours needed to reach 90% mastery."""
        hours_needed = {}
        for topic in topics:
            # Get base estimate
            base_hours = self.MASTERY_ESTIMATES.get(topic, 10)

            # Adjust based on current mastery
            current = current_mastery.get(topic, 0)
            mastery_gap = (90 - current) / 100.0

            # Hours needed = base * mastery gap (at least 2 hours minimum)
            hours = max(2, base_hours * mastery_gap)
            hours_needed[topic] = hours

        return hours_needed

    def _order_by_prerequisites(self, topics: List[str]) -> List[str]:
        """Order topics so prerequisites come first."""
        ordered = []
        remaining = set(topics)

        while remaining:
            # Find topics with no unsatisfied prerequisites
            candidates = [
                t
                for t in remaining
                if all(p in ordered + [t] for p in self.PREREQUISITES.get(t, []))
            ]

            if not candidates:
                # No valid candidates, just take remaining
                candidates = list(remaining)

            # Add shortest-duration topics first (quick wins)
            candidates.sort(key=lambda t: self.MASTERY_ESTIMATES.get(t, 10))
            topic = candidates[0]
            ordered.append(topic)
            remaining.remove(topic)

        return ordered

    def _create_daily_plan(
        self,
        ordered_topics: List[str],
        hours_needed: Dict[str, float],
        days_available: int,
        hours_per_day: float,
        start_date: datetime,
    ) -> List[DailyStudyPlan]:
        """Create a day-by-day study schedule."""
        daily_plans = []
        remaining_hours = {**hours_needed}
        current_topics = []

        for day in range(days_available):
            date = start_date + timedelta(days=day)

            # Select topics for this day
            available_hours = hours_per_day
            daily_topics = []

            # Continue current topics
            for topic in current_topics[:]:
                if remaining_hours[topic] > 0:
                    hours_to_study = min(available_hours, remaining_hours[topic])
                    remaining_hours[topic] -= hours_to_study
                    available_hours -= hours_to_study
                    daily_topics.append(topic)

                    if remaining_hours[topic] == 0:
                        current_topics.remove(topic)

            # Add new topics
            for topic in ordered_topics:
                if topic not in current_topics + daily_topics:
                    if remaining_hours[topic] > 0:
                        hours_to_study = min(available_hours, remaining_hours[topic])
                        remaining_hours[topic] -= hours_to_study
                        available_hours -= hours_to_study
                        daily_topics.append(topic)
                        current_topics.append(topic)

            if daily_topics:
                daily_plans.append(
                    DailyStudyPlan(
                        date=date.date().isoformat(),
                        topics=daily_topics,
                        estimatedDuration=int(hours_per_day * 60),
                        activities=[
                            "Review notes and concepts",
                            "Solve practice problems",
                            "Take a quiz on material",
                        ],
                        focusAreas=daily_topics,
                    )
                )

        return daily_plans

    def _create_milestones(
        self,
        daily_plan: List[DailyStudyPlan],
        current_mastery: Dict[str, float],
        topics: List[str],
    ) -> List[StudyMilestone]:
        """Create progress milestones throughout the study period."""
        milestones = []

        if not daily_plan:
            return milestones

        # Milestone at 25%, 50%, 75% through study plan
        total_days = len(daily_plan)
        milestone_days = [
            int(total_days * 0.25),
            int(total_days * 0.5),
            int(total_days * 0.75),
            total_days - 1,  # Final milestone
        ]

        milestone_labels = [
            "Early Progress",
            "Mid-Study Checkpoint",
            "Final Stretch",
            "Exam Ready",
        ]

        for day_idx, label in zip(milestone_days, milestone_labels):
            if day_idx < len(daily_plan):
                plan = daily_plan[day_idx]
                date = plan.date

                # Estimate mastery based on progress
                progress_frac = (day_idx + 1) / total_days
                expected_mastery = min(90, progress_frac * 90)

                milestones.append(
                    StudyMilestone(
                        date=date,
                        expectedMastery=expected_mastery,
                        topics=plan.topics,
                        checkpoint=label,
                    )
                )

        return milestones
