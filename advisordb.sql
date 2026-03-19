-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 20, 2025 at 05:05 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `advisordb`
--

-- --------------------------------------------------------

--
-- Table structure for table `academic_degree`
--

CREATE TABLE `academic_degree` (
  `academic_degree_id` int(11) NOT NULL,
  `degree_code` varchar(20) NOT NULL,
  `degree_name_th` varchar(100) NOT NULL,
  `degree_name_en` varchar(100) DEFAULT NULL,
  `sort_order` tinyint(4) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `academic_degree`
--

INSERT INTO `academic_degree` (`academic_degree_id`, `degree_code`, `degree_name_th`, `degree_name_en`, `sort_order`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'NONE', '', NULL, 0, 1, '2025-10-20 00:49:24', '2025-10-20 00:49:24'),
(2, 'BSC', 'วท.บ.', 'B.Sc.', 1, 1, '2025-10-20 00:49:24', '2025-10-20 00:49:24'),
(3, 'MSC', 'วท.ม.', 'M.Sc.', 2, 1, '2025-10-20 00:49:24', '2025-10-20 00:49:24'),
(4, 'MBA', 'บธ.ม.', 'M.B.A.', 3, 1, '2025-10-20 00:49:24', '2025-10-20 00:49:24'),
(5, 'MA', 'ศศ.ม.', 'M.A.', 4, 1, '2025-10-20 00:49:24', '2025-10-20 00:49:24'),
(6, 'PHD', 'ดร.', 'Ph.D.', 5, 1, '2025-10-20 00:49:24', '2025-10-20 00:49:24');

-- --------------------------------------------------------

--
-- Table structure for table `academic_rank`
--

CREATE TABLE `academic_rank` (
  `academic_rank_id` int(11) NOT NULL,
  `rank_code` varchar(20) NOT NULL,
  `rank_name_th` varchar(100) NOT NULL,
  `rank_name_en` varchar(100) DEFAULT NULL,
  `sort_order` tinyint(4) NOT NULL DEFAULT 0,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `academic_rank`
--

INSERT INTO `academic_rank` (`academic_rank_id`, `rank_code`, `rank_name_th`, `rank_name_en`, `sort_order`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'LECT', 'อาจารย์', 'Lecturer', 1, 1, '2025-10-20 00:49:24', '2025-10-20 00:49:24'),
(2, 'ASST', 'ผู้ช่วยศาสตราจารย์', 'Assistant Professor', 2, 1, '2025-10-20 00:49:24', '2025-10-20 00:49:24'),
(3, 'ASSOC', 'รองศาสตราจารย์', 'Associate Professor', 3, 1, '2025-10-20 00:49:24', '2025-10-20 00:49:24'),
(4, 'PROF', 'ศาสตราจารย์', 'Professor', 4, 1, '2025-10-20 00:49:24', '2025-10-20 00:49:24'),
(5, 'LECT_DR', 'อาจารย์ ดร.', 'Lecturer Dr.', 1, 1, '2025-10-20 00:49:24', '2025-10-20 00:49:24'),
(6, 'ASST_DR', 'ผู้ช่วยศาสตราจารย์ ดร.', 'Assistant Professor Dr.', 2, 1, '2025-10-20 00:49:24', '2025-10-20 00:49:24'),
(7, 'ASSOC_DR', 'รองศาสตราจารย์ ดร.', 'Associate Professor Dr.', 3, 1, '2025-10-20 00:49:24', '2025-10-20 00:49:24'),
(8, 'PROF_DR', 'ศาสตราจารย์ ดร.', 'Professor Dr.', 4, 1, '2025-10-20 00:49:24', '2025-10-20 00:49:24');

-- --------------------------------------------------------

--
-- Table structure for table `academic_term`
--

CREATE TABLE `academic_term` (
  `academic_term_id` int(11) NOT NULL,
  `academic_year` varchar(9) NOT NULL,
  `term` enum('ต้น','ปลาย','ฤดูร้อน') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `academic_term`
--

INSERT INTO `academic_term` (`academic_term_id`, `academic_year`, `term`, `created_at`, `updated_at`) VALUES
(1, '2566', 'ปลาย', '2025-10-20 00:49:24', '2025-10-20 00:49:24'),
(2, '2567', 'ต้น', '2025-10-20 00:49:24', '2025-10-20 00:49:24'),
(3, '2567', 'ปลาย', '2025-10-20 00:49:24', '2025-10-20 00:49:24'),
(4, '2568', 'ต้น', '2025-10-20 00:49:24', '2025-10-20 00:49:24'),
(5, '2568', 'ปลาย', '2025-10-20 00:49:24', '2025-10-20 00:49:24'),
(6, '2569', 'ต้น', '2025-10-20 00:49:24', '2025-10-20 00:49:24');

-- --------------------------------------------------------

--
-- Table structure for table `administrator`
--

CREATE TABLE `administrator` (
  `admin_id` int(11) NOT NULL,
  `prefix` varchar(10) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `email` varchar(191) NOT NULL,
  `password` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `administrator`
--

INSERT INTO `administrator` (`admin_id`, `prefix`, `first_name`, `last_name`, `image`, `email`, `password`, `created_at`, `updated_at`) VALUES
(1, '', 'Admin', 'User', NULL, 'admin@ku.th', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', '2025-10-20 00:49:24', '2025-10-20 00:49:24');

-- --------------------------------------------------------

--
-- Table structure for table `advisor`
--

CREATE TABLE `advisor` (
  `advisor_id` int(11) NOT NULL,
  `prefix` varchar(10) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `academic_rank_id` int(11) NOT NULL,
  `academic_degree_id` int(11) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(191) NOT NULL,
  `password` varchar(255) NOT NULL,
  `project_capacity` int(11) NOT NULL DEFAULT 0,
  `faculty_id` int(11) NOT NULL,
  `department_id` int(11) NOT NULL,
  `program_id` int(11) NOT NULL,
  `interests` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `advisor`
--

INSERT INTO `advisor` (`advisor_id`, `prefix`, `first_name`, `last_name`, `image`, `academic_rank_id`, `academic_degree_id`, `phone`, `email`, `password`, `project_capacity`, `faculty_id`, `department_id`, `program_id`, `interests`, `created_at`, `updated_at`) VALUES
(1, 'ผศ.', 'สมศักดิ์', 'สอนดี', NULL, 2, 6, '081-234-5678', 'somsak.s@ku.th', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 3, 1, 1, 1, 'การพัฒนาเว็บแอปพลิเคชัน, ปัญญาประดิษฐ์', '2025-10-20 00:49:24', '2025-10-20 00:49:24'),
(2, 'รศ.', 'มาลัย', 'เก่งมาก', NULL, 3, 6, '082-345-6789', 'malai.k@ku.th', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 5, 2, 4, 6, 'วิทยาศาสตร์ข้อมูล, การวิเคราะห์ข้อมูล', '2025-10-20 00:49:24', '2025-10-20 00:49:24'),
(3, 'ศ.', 'ประเสริฐ', 'ฉลาดสุด', NULL, 4, 6, '083-456-7890', 'prasert.c@ku.th', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 2, 1, 1, 2, 'ความปลอดภัยไซเบอร์, การพัฒนาแอปพลิเคชันมือถือ', '2025-10-20 00:49:24', '2025-10-20 00:49:24'),
(4, 'อาจารย์', 'ปฏิพัทธ์', 'สิทธิ์ประเสริฐ', NULL, 1, 1, '084-567-8901', 'patipat.si@ku.th', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 4, 2, 4, 6, 'การออกแบบฐานข้อมูล, การวิเคราะห์ระบบ', '2025-10-20 00:49:24', '2025-10-20 03:01:43'),
(5, 'ผศ.ดร.', 'มาลี', 'ขยันสอน', NULL, 6, 6, '085-678-9012', 'malee.k2@ku.th', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 3, 1, 2, 3, 'การจัดการโปรเจกต์, การออกแบบ UX/UI', '2025-10-20 00:49:24', '2025-10-20 00:49:24');

-- --------------------------------------------------------

--
-- Stand-in structure for view `advisor_capacity_view`
-- (See below for the actual view)
--
CREATE TABLE `advisor_capacity_view` (
`advisor_id` int(11)
,`first_name` varchar(50)
,`last_name` varchar(50)
,`project_capacity` int(11)
,`approved_requests` decimal(22,0)
,`available_capacity` decimal(23,0)
);

-- --------------------------------------------------------

--
-- Table structure for table `advisor_expertise`
--

CREATE TABLE `advisor_expertise` (
  `advisor_id` int(11) NOT NULL,
  `expertise_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `advisor_expertise`
--

INSERT INTO `advisor_expertise` (`advisor_id`, `expertise_id`) VALUES
(1, 1),
(1, 3),
(1, 4),
(1, 6),
(2, 4),
(2, 13),
(2, 14),
(2, 19),
(3, 2),
(3, 5),
(3, 15),
(3, 16),
(4, 6),
(4, 7),
(4, 14),
(4, 20),
(5, 8),
(5, 9),
(5, 18),
(5, 19);

-- --------------------------------------------------------

--
-- Stand-in structure for view `auth_accounts`
-- (See below for the actual view)
--
CREATE TABLE `auth_accounts` (
`role` varchar(7)
,`user_id` varchar(20)
,`email` varchar(191)
,`password_hash` varchar(255)
);

-- --------------------------------------------------------

--
-- Table structure for table `department`
--

CREATE TABLE `department` (
  `department_id` int(11) NOT NULL,
  `department_name` varchar(100) NOT NULL,
  `faculty_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `department`
--

INSERT INTO `department` (`department_id`, `department_name`, `faculty_id`, `created_at`, `updated_at`) VALUES
(1, 'วิศวกรรมคอมพิวเตอร์', 1, '2025-10-20 00:49:24', '2025-10-20 00:49:24'),
(2, 'วิศวกรรมไฟฟ้า', 1, '2025-10-20 00:49:24', '2025-10-20 00:49:24'),
(3, 'วิศวกรรมเครื่องกล', 1, '2025-10-20 00:49:24', '2025-10-20 00:49:24'),
(4, 'วิทยาการคอมพิวเตอร์', 2, '2025-10-20 00:49:24', '2025-10-20 00:49:24'),
(5, 'คณิตศาสตร์', 2, '2025-10-20 00:49:24', '2025-10-20 00:49:24'),
(6, 'ฟิสิกส์', 2, '2025-10-20 00:49:24', '2025-10-20 00:49:24'),
(7, 'การจัดการ', 3, '2025-10-20 00:49:24', '2025-10-20 00:49:24'),
(8, 'การบัญชี', 3, '2025-10-20 00:49:24', '2025-10-20 00:49:24'),
(9, 'ภาษาอังกฤษ', 4, '2025-10-20 00:49:24', '2025-10-20 00:49:24'),
(10, 'ภาษาไทย', 4, '2025-10-20 00:49:24', '2025-10-20 00:49:24'),
(11, 'เทคโนโลยีการศึกษา', 5, '2025-10-20 00:49:24', '2025-10-20 00:49:24');

-- --------------------------------------------------------

--
-- Table structure for table `expertise`
--

CREATE TABLE `expertise` (
  `expertise_id` int(11) NOT NULL,
  `expertise_name` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `expertise`
--

INSERT INTO `expertise` (`expertise_id`, `expertise_name`, `created_at`, `updated_at`) VALUES
(1, 'การพัฒนาเว็บแอปพลิเคชัน', '2025-10-20 00:49:24', '2025-10-20 00:49:24'),
(2, 'การพัฒนาแอปพลิเคชันมือถือ', '2025-10-20 00:49:24', '2025-10-20 00:49:24'),
(3, 'ปัญญาประดิษฐ์และแมชชีนเลิร์นนิง', '2025-10-20 00:49:24', '2025-10-20 00:49:24'),
(4, 'วิทยาศาสตร์ข้อมูล', '2025-10-20 00:49:24', '2025-10-20 00:49:24'),
(5, 'ความปลอดภัยไซเบอร์', '2025-10-20 00:49:24', '2025-10-20 00:49:24'),
(6, 'การออกแบบฐานข้อมูล', '2025-10-20 00:49:24', '2025-10-20 00:49:24'),
(7, 'การวิเคราะห์ระบบ', '2025-10-20 00:49:24', '2025-10-20 00:49:24'),
(8, 'การจัดการโปรเจกต์', '2025-10-20 00:49:24', '2025-10-20 00:49:24'),
(9, 'การออกแบบ UX/UI', '2025-10-20 00:49:24', '2025-10-20 00:49:24'),
(10, 'การพัฒนาเกม', '2025-10-20 00:49:24', '2025-10-20 00:49:24'),
(11, 'การประมวลผลภาพ', '2025-10-20 00:49:24', '2025-10-20 00:49:24'),
(12, 'การประมวลผลภาษาธรรมชาติ', '2025-10-20 00:49:24', '2025-10-20 00:49:24'),
(13, 'การวิเคราะห์ข้อมูล', '2025-10-20 00:49:24', '2025-10-20 00:49:24'),
(14, 'การออกแบบอัลกอริทึม', '2025-10-20 00:49:24', '2025-10-20 00:49:24'),
(15, 'การพัฒนาแอปพลิเคชันคลาวด์', '2025-10-20 00:49:24', '2025-10-20 00:49:24'),
(16, 'การจัดการเครือข่าย', '2025-10-20 00:49:24', '2025-10-20 00:49:24'),
(17, 'การพัฒนา IoT', '2025-10-20 00:49:24', '2025-10-20 00:49:24'),
(18, 'การวิเคราะห์ธุรกิจ', '2025-10-20 00:49:24', '2025-10-20 00:49:24'),
(19, 'การจัดการข้อมูล', '2025-10-20 00:49:24', '2025-10-20 00:49:24'),
(20, 'การออกแบบซอฟต์แวร์', '2025-10-20 00:49:24', '2025-10-20 00:49:24');

-- --------------------------------------------------------

--
-- Table structure for table `faculty`
--

CREATE TABLE `faculty` (
  `faculty_id` int(11) NOT NULL,
  `faculty_name` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `faculty`
--

INSERT INTO `faculty` (`faculty_id`, `faculty_name`, `created_at`, `updated_at`) VALUES
(1, 'คณะวิศวกรรมศาสตร์', '2025-10-20 00:49:24', '2025-10-20 00:49:24'),
(2, 'คณะวิทยาศาสตร์', '2025-10-20 00:49:24', '2025-10-20 00:49:24'),
(3, 'คณะบริหารธุรกิจ', '2025-10-20 00:49:24', '2025-10-20 00:49:24'),
(4, 'คณะศิลปศาสตร์', '2025-10-20 00:49:24', '2025-10-20 00:49:24'),
(5, 'คณะครุศาสตร์', '2025-10-20 00:49:24', '2025-10-20 00:49:24');

-- --------------------------------------------------------

--
-- Table structure for table `program`
--

CREATE TABLE `program` (
  `program_id` int(11) NOT NULL,
  `program_name` varchar(100) NOT NULL,
  `department_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `program`
--

INSERT INTO `program` (`program_id`, `program_name`, `department_id`, `created_at`, `updated_at`) VALUES
(1, 'วิศวกรรมคอมพิวเตอร์', 1, '2025-10-20 00:49:24', '2025-10-20 00:49:24'),
(2, 'วิศวกรรมซอฟต์แวร์', 1, '2025-10-20 00:49:24', '2025-10-20 00:49:24'),
(3, 'วิศวกรรมไฟฟ้า', 2, '2025-10-20 00:49:24', '2025-10-20 00:49:24'),
(4, 'วิศวกรรมอิเล็กทรอนิกส์', 2, '2025-10-20 00:49:24', '2025-10-20 00:49:24'),
(5, 'วิศวกรรมเครื่องกล', 3, '2025-10-20 00:49:24', '2025-10-20 00:49:24'),
(6, 'วิทยาการคอมพิวเตอร์', 4, '2025-10-20 00:49:24', '2025-10-20 00:49:24'),
(7, 'เทคโนโลยีสารสนเทศ', 4, '2025-10-20 00:49:24', '2025-10-20 00:49:24'),
(8, 'คณิตศาสตร์', 5, '2025-10-20 00:49:24', '2025-10-20 00:49:24'),
(9, 'ฟิสิกส์', 6, '2025-10-20 00:49:24', '2025-10-20 00:49:24'),
(10, 'การจัดการ', 7, '2025-10-20 00:49:24', '2025-10-20 00:49:24'),
(11, 'การบัญชี', 8, '2025-10-20 00:49:24', '2025-10-20 00:49:24'),
(12, 'ภาษาอังกฤษ', 9, '2025-10-20 00:49:24', '2025-10-20 00:49:24'),
(13, 'ภาษาไทย', 10, '2025-10-20 00:49:24', '2025-10-20 00:49:24'),
(14, 'เทคโนโลยีการศึกษา', 11, '2025-10-20 00:49:24', '2025-10-20 00:49:24');

-- --------------------------------------------------------

--
-- Table structure for table `request`
--

CREATE TABLE `request` (
  `request_id` int(11) NOT NULL,
  `student_id` varchar(20) NOT NULL,
  `advisor_id` int(11) NOT NULL,
  `academic_term_id` int(11) NOT NULL,
  `submit_date` date NOT NULL,
  `project_title` varchar(255) DEFAULT NULL,
  `project_detail` text DEFAULT NULL,
  `proposal_file` varchar(255) DEFAULT NULL,
  `status` enum('รอดำเนินการ','อนุมัติ','ปฏิเสธ','หมดอายุ') NOT NULL DEFAULT 'รอดำเนินการ',
  `approve_date` date DEFAULT NULL,
  `expire_date` date DEFAULT NULL,
  `suggestion` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `request`
--

INSERT INTO `request` (`request_id`, `student_id`, `advisor_id`, `academic_term_id`, `submit_date`, `project_title`, `project_detail`, `proposal_file`, `status`, `approve_date`, `expire_date`, `suggestion`, `created_at`, `updated_at`) VALUES
(1, '61123456789', 1, 3, '2024-10-15', 'ระบบจัดการหอพักออนไลน์', 'พัฒนาเว็บแอปพลิเคชันสำหรับจัดการหอพัก', NULL, 'อนุมัติ', '2024-10-16', NULL, NULL, '2025-10-20 00:49:24', '2025-10-20 00:49:24'),
(2, '61123456789', 2, 3, '2024-10-15', 'ระบบจัดการหอพักออนไลน์', 'พัฒนาเว็บแอปพลิเคชันสำหรับจัดการหอพัก', NULL, 'ปฏิเสธ', NULL, NULL, NULL, '2025-10-20 00:49:24', '2025-10-20 00:49:24'),
(3, '61123456789', 3, 3, '2024-10-15', 'ระบบจัดการหอพักออนไลน์', 'พัฒนาเว็บแอปพลิเคชันสำหรับจัดการหอพัก', NULL, 'ปฏิเสธ', NULL, NULL, NULL, '2025-10-20 00:49:24', '2025-10-20 00:49:24'),
(4, '61234567890', 1, 3, '2024-10-16', 'แอปพลิเคชันจองอาหาร', 'พัฒนาแอปมือถือสำหรับจองอาหารในโรงอาหาร', NULL, 'รอดำเนินการ', NULL, NULL, NULL, '2025-10-20 00:49:24', '2025-10-20 00:49:24'),
(5, '61234567890', 4, 3, '2024-10-16', 'แอปพลิเคชันจองอาหาร', 'พัฒนาแอปมือถือสำหรับจองอาหารในโรงอาหาร', NULL, 'รอดำเนินการ', NULL, NULL, NULL, '2025-10-20 00:49:24', '2025-10-20 00:49:24'),
(6, '61345678901', 2, 3, '2024-10-17', 'ระบบวิเคราะห์ข้อมูลการเรียน', 'ใช้ AI วิเคราะห์พฤติกรรมการเรียนของนักศึกษา', NULL, 'อนุมัติ', '2024-10-18', NULL, NULL, '2025-10-20 00:49:24', '2025-10-20 00:49:24'),
(7, '61456789012', 3, 3, '2024-10-18', 'ระบบรักษาความปลอดภัยข้อมูล', 'พัฒนาระบบป้องกันข้อมูลส่วนบุคคล', NULL, 'รอดำเนินการ', NULL, NULL, NULL, '2025-10-20 00:49:24', '2025-10-20 00:49:24'),
(8, '61456789012', 5, 3, '2024-10-18', 'ระบบรักษาความปลอดภัยข้อมูล', 'พัฒนาระบบป้องกันข้อมูลส่วนบุคคล', NULL, 'รอดำเนินการ', NULL, NULL, NULL, '2025-10-20 00:49:24', '2025-10-20 00:49:24'),
(9, '61567890123', 4, 3, '2024-10-19', 'ระบบจัดการคลังสินค้า', 'พัฒนาเว็บแอปพลิเคชันสำหรับจัดการคลังสินค้า', NULL, 'รอดำเนินการ', NULL, NULL, NULL, '2025-10-20 00:49:24', '2025-10-20 00:49:24');

-- --------------------------------------------------------

--
-- Table structure for table `student`
--

CREATE TABLE `student` (
  `student_id` varchar(20) NOT NULL,
  `prefix` varchar(10) NOT NULL,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `email` varchar(191) NOT NULL,
  `password` varchar(255) NOT NULL,
  `faculty_id` int(11) NOT NULL,
  `department_id` int(11) NOT NULL,
  `program_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `student`
--

INSERT INTO `student` (`student_id`, `prefix`, `first_name`, `last_name`, `image`, `email`, `password`, `faculty_id`, `department_id`, `program_id`, `created_at`, `updated_at`) VALUES
('61123456789', 'นาย', 'สมชาย', 'ใจดี', NULL, 'somchai.j@ku.th', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 1, 1, 1, '2025-10-20 00:49:24', '2025-10-20 00:49:24'),
('61234567890', 'นางสาว', 'สมหญิง', 'รักเรียน', NULL, 'somying.r@ku.th', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 1, 1, 1, '2025-10-20 00:49:24', '2025-10-20 00:49:24'),
('61345678901', 'นาย', 'วิชัย', 'เก่งมาก', NULL, 'wichai.k@ku.th', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 2, 4, 6, '2025-10-20 00:49:24', '2025-10-20 00:49:24'),
('61456789012', 'นางสาว', 'มาลี', 'ขยันเรียน', NULL, 'malee.k@ku.th', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 1, 1, 2, '2025-10-20 00:49:24', '2025-10-20 00:49:24'),
('61567890123', 'นาย', 'นายภูเบศ', 'โพติยะ', NULL, 'phubet.ph@ku.th', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 2, 4, 7, '2025-10-20 00:49:24', '2025-10-20 03:04:27');

-- --------------------------------------------------------

--
-- Table structure for table `student_advisor`
--

CREATE TABLE `student_advisor` (
  `student_id` varchar(20) NOT NULL,
  `advisor_id` int(11) NOT NULL,
  `assigned_at` datetime NOT NULL DEFAULT current_timestamp(),
  `ended_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `student_advisor`
--

INSERT INTO `student_advisor` (`student_id`, `advisor_id`, `assigned_at`, `ended_at`) VALUES
('61123456789', 1, '2024-10-16 10:30:00', NULL),
('61345678901', 2, '2024-10-18 14:20:00', NULL);

-- --------------------------------------------------------

--
-- Structure for view `advisor_capacity_view`
--
DROP TABLE IF EXISTS `advisor_capacity_view`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `advisor_capacity_view`  AS SELECT `a`.`advisor_id` AS `advisor_id`, `a`.`first_name` AS `first_name`, `a`.`last_name` AS `last_name`, `a`.`project_capacity` AS `project_capacity`, coalesce(sum(case when `r`.`status` = 'อนุมัติ' then 1 else 0 end),0) AS `approved_requests`, `a`.`project_capacity`- coalesce(sum(case when `r`.`status` = 'อนุมัติ' then 1 else 0 end),0) AS `available_capacity` FROM (`advisor` `a` left join `request` `r` on(`r`.`advisor_id` = `a`.`advisor_id`)) GROUP BY `a`.`advisor_id`, `a`.`first_name`, `a`.`last_name`, `a`.`project_capacity` ;

-- --------------------------------------------------------

--
-- Structure for view `auth_accounts`
--
DROP TABLE IF EXISTS `auth_accounts`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `auth_accounts`  AS SELECT 'student' COLLATE utf8mb4_unicode_ci AS `role`, CAST(`student`.`student_id` AS CHAR(20) CHARSET utf8mb4) COLLATE utf8mb4_unicode_ci AS `user_id`, `student`.`email` COLLATE utf8mb4_unicode_ci AS `email`, `student`.`password` COLLATE utf8mb4_unicode_ci AS `password_hash` FROM `student` UNION ALL SELECT 'advisor' COLLATE utf8mb4_unicode_ci AS `role`, CAST(`advisor`.`advisor_id` AS CHAR(20) CHARSET utf8mb4) COLLATE utf8mb4_unicode_ci AS `user_id`, `advisor`.`email` COLLATE utf8mb4_unicode_ci AS `email`, `advisor`.`password` COLLATE utf8mb4_unicode_ci AS `password_hash` FROM `advisor` UNION ALL SELECT 'admin' COLLATE utf8mb4_unicode_ci AS `role`, CAST(`administrator`.`admin_id` AS CHAR(20) CHARSET utf8mb4) COLLATE utf8mb4_unicode_ci AS `user_id`, `administrator`.`email` COLLATE utf8mb4_unicode_ci AS `email`, `administrator`.`password` COLLATE utf8mb4_unicode_ci AS `password_hash` FROM `administrator`;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `academic_degree`
--
ALTER TABLE `academic_degree`
  ADD PRIMARY KEY (`academic_degree_id`),
  ADD UNIQUE KEY `ux_academic_degree_code` (`degree_code`);

--
-- Indexes for table `academic_rank`
--
ALTER TABLE `academic_rank`
  ADD PRIMARY KEY (`academic_rank_id`),
  ADD UNIQUE KEY `ux_academic_rank_code` (`rank_code`);

--
-- Indexes for table `academic_term`
--
ALTER TABLE `academic_term`
  ADD PRIMARY KEY (`academic_term_id`),
  ADD UNIQUE KEY `ux_academic_year_term` (`academic_year`,`term`);

--
-- Indexes for table `administrator`
--
ALTER TABLE `administrator`
  ADD PRIMARY KEY (`admin_id`),
  ADD UNIQUE KEY `ux_admin_email` (`email`);

--
-- Indexes for table `advisor`
--
ALTER TABLE `advisor`
  ADD PRIMARY KEY (`advisor_id`),
  ADD UNIQUE KEY `ux_advisor_email` (`email`),
  ADD KEY `idx_advisor_rank` (`academic_rank_id`),
  ADD KEY `idx_advisor_degree` (`academic_degree_id`),
  ADD KEY `idx_advisor_faculty` (`faculty_id`),
  ADD KEY `idx_advisor_department` (`department_id`),
  ADD KEY `idx_advisor_program` (`program_id`);

--
-- Indexes for table `advisor_expertise`
--
ALTER TABLE `advisor_expertise`
  ADD PRIMARY KEY (`advisor_id`,`expertise_id`),
  ADD KEY `idx_advexp_expertise` (`expertise_id`);

--
-- Indexes for table `department`
--
ALTER TABLE `department`
  ADD PRIMARY KEY (`department_id`),
  ADD KEY `idx_department_faculty` (`faculty_id`);

--
-- Indexes for table `expertise`
--
ALTER TABLE `expertise`
  ADD PRIMARY KEY (`expertise_id`),
  ADD UNIQUE KEY `ux_expertise_name` (`expertise_name`);

--
-- Indexes for table `faculty`
--
ALTER TABLE `faculty`
  ADD PRIMARY KEY (`faculty_id`),
  ADD UNIQUE KEY `ux_faculty_name` (`faculty_name`);

--
-- Indexes for table `program`
--
ALTER TABLE `program`
  ADD PRIMARY KEY (`program_id`),
  ADD KEY `idx_program_department` (`department_id`);

--
-- Indexes for table `request`
--
ALTER TABLE `request`
  ADD PRIMARY KEY (`request_id`),
  ADD KEY `idx_request_student` (`student_id`),
  ADD KEY `idx_request_advisor` (`advisor_id`),
  ADD KEY `idx_request_status` (`status`),
  ADD KEY `idx_request_submit_date` (`submit_date`),
  ADD KEY `fk_request_term` (`academic_term_id`);

--
-- Indexes for table `student`
--
ALTER TABLE `student`
  ADD PRIMARY KEY (`student_id`),
  ADD UNIQUE KEY `ux_student_email` (`email`),
  ADD KEY `idx_student_faculty` (`faculty_id`),
  ADD KEY `idx_student_department` (`department_id`),
  ADD KEY `idx_student_program` (`program_id`);

--
-- Indexes for table `student_advisor`
--
ALTER TABLE `student_advisor`
  ADD PRIMARY KEY (`student_id`),
  ADD KEY `idx_stuadv_advisor` (`advisor_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `academic_degree`
--
ALTER TABLE `academic_degree`
  MODIFY `academic_degree_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `academic_rank`
--
ALTER TABLE `academic_rank`
  MODIFY `academic_rank_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `academic_term`
--
ALTER TABLE `academic_term`
  MODIFY `academic_term_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `administrator`
--
ALTER TABLE `administrator`
  MODIFY `admin_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `advisor`
--
ALTER TABLE `advisor`
  MODIFY `advisor_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `department`
--
ALTER TABLE `department`
  MODIFY `department_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `expertise`
--
ALTER TABLE `expertise`
  MODIFY `expertise_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `faculty`
--
ALTER TABLE `faculty`
  MODIFY `faculty_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `program`
--
ALTER TABLE `program`
  MODIFY `program_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `request`
--
ALTER TABLE `request`
  MODIFY `request_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `advisor`
--
ALTER TABLE `advisor`
  ADD CONSTRAINT `fk_advisor_degree` FOREIGN KEY (`academic_degree_id`) REFERENCES `academic_degree` (`academic_degree_id`),
  ADD CONSTRAINT `fk_advisor_department` FOREIGN KEY (`department_id`) REFERENCES `department` (`department_id`),
  ADD CONSTRAINT `fk_advisor_faculty` FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`faculty_id`),
  ADD CONSTRAINT `fk_advisor_program` FOREIGN KEY (`program_id`) REFERENCES `program` (`program_id`),
  ADD CONSTRAINT `fk_advisor_rank` FOREIGN KEY (`academic_rank_id`) REFERENCES `academic_rank` (`academic_rank_id`);

--
-- Constraints for table `advisor_expertise`
--
ALTER TABLE `advisor_expertise`
  ADD CONSTRAINT `fk_advexp_advisor` FOREIGN KEY (`advisor_id`) REFERENCES `advisor` (`advisor_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_advexp_expertise` FOREIGN KEY (`expertise_id`) REFERENCES `expertise` (`expertise_id`);

--
-- Constraints for table `department`
--
ALTER TABLE `department`
  ADD CONSTRAINT `fk_department_faculty` FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`faculty_id`);

--
-- Constraints for table `program`
--
ALTER TABLE `program`
  ADD CONSTRAINT `fk_program_department` FOREIGN KEY (`department_id`) REFERENCES `department` (`department_id`);

--
-- Constraints for table `request`
--
ALTER TABLE `request`
  ADD CONSTRAINT `fk_request_advisor` FOREIGN KEY (`advisor_id`) REFERENCES `advisor` (`advisor_id`),
  ADD CONSTRAINT `fk_request_student` FOREIGN KEY (`student_id`) REFERENCES `student` (`student_id`),
  ADD CONSTRAINT `fk_request_term` FOREIGN KEY (`academic_term_id`) REFERENCES `academic_term` (`academic_term_id`);

--
-- Constraints for table `student`
--
ALTER TABLE `student`
  ADD CONSTRAINT `fk_student_department` FOREIGN KEY (`department_id`) REFERENCES `department` (`department_id`),
  ADD CONSTRAINT `fk_student_faculty` FOREIGN KEY (`faculty_id`) REFERENCES `faculty` (`faculty_id`),
  ADD CONSTRAINT `fk_student_program` FOREIGN KEY (`program_id`) REFERENCES `program` (`program_id`);

--
-- Constraints for table `student_advisor`
--
ALTER TABLE `student_advisor`
  ADD CONSTRAINT `fk_stuadv_advisor` FOREIGN KEY (`advisor_id`) REFERENCES `advisor` (`advisor_id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_stuadv_student` FOREIGN KEY (`student_id`) REFERENCES `student` (`student_id`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
