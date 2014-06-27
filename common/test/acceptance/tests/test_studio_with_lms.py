# -*- coding: utf-8 -*-

"""
Acceptance tests that uses both Studio and LMS.
"""

from .helpers import UniqueCourseTest
from ..pages.studio.index import DashboardPage
from ..pages.studio.auto_auth import AutoAuthPage
from ..fixtures.course import CourseFixture, XBlockFixtureDesc


# from ..pages.lms.course_info import CourseInfoPage
# from ..pages.lms.tab_nav import TabNavPage


class StudioLMSTest(UniqueCourseTest):

    def setUp(self):

        super(StudioLMSTest, self).setUp()

        self.dashboard_page = DashboardPage(self.browser)

        # self.course_info_page = CourseInfoPage(self.browser, self.course_id)
        # self.tab_nav = TabNavPage(self.browser)

        course_fix = CourseFixture(
            self.course_info['org'], self.course_info['number'],
            self.course_info['run'], self.course_info['display_name']
        )

        course_fix.add_children(
            XBlockFixtureDesc('chapter', 'Test Section').add_children(
                XBlockFixtureDesc('sequential', 'Test Subsection').add_children(
                    XBlockFixtureDesc('html', 'HTML Unit', data='<p><strong>Body of HTML Unit.</strong></p>'),
                )
            )
        ).install()

        self.auth_page = AutoAuthPage(
            self.browser,
            staff=False,
            username=course_fix.user.get('username'),
            email=course_fix.user.get('email'),
            password=course_fix.user.get('password')
        )

        self.auth_page.visit()

        # AutoAuthPage(self.browser, course_id=self.course_id).visit()

    def test_1(self):

        from nose.tools import set_trace; set_trace()

        self.dashboard_page.visit()