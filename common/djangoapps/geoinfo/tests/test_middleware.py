"""
Tests for CountryMiddleware.
"""

from mock import Mock, patch
import pygeoip

from django.test import TestCase
from django.test.utils import override_settings
from django.test.client import RequestFactory
from courseware.tests.tests import TEST_DATA_MONGO_MODULESTORE
from student.models import CourseEnrollment
from student.tests.factories import UserFactory, AnonymousUserFactory

from django.contrib.sessions.middleware import SessionMiddleware
from geoinfo.middleware import CountryMiddleware


@override_settings(MODULESTORE=TEST_DATA_MONGO_MODULESTORE)
class CountryMiddlewareTests(TestCase):
    """
    Tests of CountryMiddleware.
    """
    def setUp(self):
        self.country_middleware = CountryMiddleware()
        self.session_middleware = SessionMiddleware()
        self.authenticated_user = UserFactory.create()
        self.anonymous_user = AnonymousUserFactory.create()
        self.request_factory = RequestFactory()
        self.patcher = patch.object(pygeoip.GeoIP, 'country_code_by_addr', self.mock_country_code_by_addr)
        self.patcher.start()

    def tearDown(self):
        self.patcher.stop()

    def mock_country_code_by_addr(self, ip_addr):
        """
        Gives us a fake set of IPs
        """
        ip_dict = {
            '117.79.83.1': 'CN',
            '117.79.83.100': 'CN',
            '4.0.0.0': 'SD',
        }
        return ip_dict.get(ip_addr, 'US')

    def test_country_code_added(self):
        request = self.request_factory.get('/somewhere',
                                            HTTP_X_FORWARDED_FOR='117.79.83.1')
        request.user = self.authenticated_user
        self.session_middleware.process_request(request)
        # No country code exists before request.
        self.assertNotIn('country_code', request.session)
        self.assertNotIn('ip_address', request.session)
        self.country_middleware.process_request(request)
        # Country code added to session.
        self.assertEqual('CN', request.session.get('country_code'))
        self.assertEqual('117.79.83.1', request.session.get('ip_address'))

    def test_ip_address_changed(self):
        request = self.request_factory.get('/somewhere',
                                            HTTP_X_FORWARDED_FOR='4.0.0.0')
        request.user = self.anonymous_user
        self.session_middleware.process_request(request)
        request.session['country_code'] = 'CN'
        request.session['ip_address'] = '117.79.83.1'
        self.country_middleware.process_request(request)
        # Country code is changed.
        self.assertEqual('SD', request.session.get('country_code'))
        self.assertEqual('4.0.0.0', request.session.get('ip_address'))

    def test_ip_address_is_not_changed(self):
        request = self.request_factory.get('/somewhere',
                                            HTTP_X_FORWARDED_FOR='117.79.83.1')
        request.user = self.anonymous_user
        self.session_middleware.process_request(request)
        request.session['country_code'] = 'CN'
        request.session['ip_address'] = '117.79.83.1'
        self.country_middleware.process_request(request)
        # Country code is not changed.
        self.assertEqual('CN', request.session.get('country_code'))
        self.assertEqual('117.79.83.1', request.session.get('ip_address'))

    def test_same_country_different_ip(self):
        request = self.request_factory.get('/somewhere',
                                            HTTP_X_FORWARDED_FOR='117.79.83.100')
        request.user = self.anonymous_user
        self.session_middleware.process_request(request)
        request.session['country_code'] = 'CN'
        request.session['ip_address'] = '117.79.83.1'
        self.country_middleware.process_request(request)
        # Country code is not changed.
        self.assertEqual('CN', request.session.get('country_code'))
        self.assertEqual('117.79.83.100', request.session.get('ip_address'))
