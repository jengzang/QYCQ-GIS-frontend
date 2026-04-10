import pathlib
import sys
import unittest

ROOT = pathlib.Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT))

from scripts.build_mock_data import (  # noqa: E402
    build_primaryid,
    normalize_text,
    parse_timeline_sort_year,
    resolve_dialect_group,
)


class BuildMockDataTests(unittest.TestCase):
    def test_build_primaryid_is_stable_for_city_town_and_name(self) -> None:
        self.assertEqual(
            build_primaryid("肇庆市", "高良镇", "平治村"),
            "vlg-fb354cdb",
        )

    def test_resolve_dialect_group_handles_common_keywords(self) -> None:
        self.assertEqual(resolve_dialect_group("粤方言广宁话"), "广宁话")
        self.assertEqual(resolve_dialect_group("通用粤方言德庆话"), "德庆话")
        self.assertEqual(resolve_dialect_group(""), "未填写/其他")

    def test_parse_timeline_sort_year_supports_years_and_era_labels(self) -> None:
        self.assertEqual(parse_timeline_sort_year("1907"), 1907)
        self.assertEqual(parse_timeline_sort_year("明代"), 1500)
        self.assertIsNone(parse_timeline_sort_year(""))

    def test_normalize_text_trims_and_handles_none(self) -> None:
        self.assertEqual(normalize_text(" 平治村 "), "平治村")
        self.assertEqual(normalize_text(None), "")


if __name__ == "__main__":
    unittest.main()
