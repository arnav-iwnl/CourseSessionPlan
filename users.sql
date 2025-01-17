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
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password`) VALUES
(1, 'John Doe', 'john.doe@sies.edu.in', 'password123'),
(2, 'Jane Smith', 'jane.smith@sies.edu.in', 'securepass456'),
(3, 'Alice Johnson', 'alice.johnson@sies.edu.in', 'alicepass789'),
(4, 'Bob Williams', 'bob.williams@sies.edu.in', 'bobsecret321'),
(5, 'Charlie Brown', 'charlie.brown@sies.edu.in', 'snoopy567'),
(6, 'Diana Prince', 'hod.cs@sies.edu.in', 'hodcs'),
(7, 'Ethan Hunt', 'ethan.hunt@sies.edu.in', 'mission234'),
(8, 'Fiona Gallagher', 'hod.it@sies.edu.in', 'hodit'),
(9, 'George Banks', 'george.banks@sies.edu.in', 'marypoppins789'),
(10, 'Hannah Abbott', 'hod.mech@sies.edu.in', 'hufflepuff123'),
(13, 'test', 'test@sies.edu.in', 'test123');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
