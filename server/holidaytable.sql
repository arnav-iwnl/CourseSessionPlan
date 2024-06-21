-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 21, 2024 at 12:38 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `holidays`
--

-- --------------------------------------------------------

--
-- Table structure for table `holidaytable`
--

CREATE TABLE `holidaytable` (
  `id` int(11) NOT NULL,
  `date` varchar(11) NOT NULL,
  `name` varchar(250) NOT NULL,
  `type` varchar(250) NOT NULL,
  `holiday` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `holidaytable`
--

INSERT INTO `holidaytable` (`id`, `date`, `name`, `type`, `holiday`) VALUES
(201, '02-02-24', 'Groundhog Day', 'cultural', 0),
(202, '03-14-24', 'Pi Day', 'educational', 0),
(203, '05-01-24', 'May Day', 'international', 1),
(204, '06-05-24', 'World Environment Day', 'environmental', 0),
(205, '07-04-24', 'Independence Day', 'national', 1),
(206, '08-19-24', 'World Photography Day', 'cultural', 0),
(207, '09-21-24', 'International Day of Peace', 'international', 1),
(208, '10-31-24', 'Halloween', 'cultural', 0),
(209, '11-11-24', 'Veterans Day', 'national', 1),
(210, '12-25-24', 'Christmas Day', 'religious', 1),
(211, '07-08-24', 'START', 'teaching', 0),
(212, '10-5-24', 'END', 'non teach', 0);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
