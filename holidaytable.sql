-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 02, 2024 at 04:15 PM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `test`
--

-- --------------------------------------------------------

--
-- Table structure for table `holidaytable`
--

CREATE TABLE `holidaytable` (
  `id` int(11) NOT NULL,
  `date` date NOT NULL,
  `name` varchar(250) NOT NULL,
  `type` varchar(250) NOT NULL,
  `institute_level` tinyint(1) NOT NULL DEFAULT 0,
  `department_level` tinyint(1) NOT NULL DEFAULT 0,
  `holiday` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `holidaytable`
--

INSERT INTO `holidaytable` (`id`, `date`, `name`, `type`, `institute_level`, `department_level`, `holiday`) VALUES
(1, '2024-07-08', 'Start_Session_SE/TE/BE', 'Start Session for SE/TE/BE', 0, 0, 0),
(2, '2024-07-22', 'Public Event', 'Event', 0, 0, 1),
(3, '2024-10-17', 'End_Session_SE/TE/BE', 'End Session for SE/TE/BE', 0, 0, 0),
(4, '2024-09-01', 'Public Holiday', 'Public Holiday', 0, 0, 1),
(5, '2024-09-15', 'Public Event', 'Event', 0, 0, 1),
(6, '2024-09-21', 'Public Holiday', 'Public Holiday', 0, 0, 1),
(7, '2024-10-01', 'Public Holiday', 'Public Holiday', 0, 0, 1);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `holidaytable`
--
ALTER TABLE `holidaytable`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `holidaytable`
--
ALTER TABLE `holidaytable`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
