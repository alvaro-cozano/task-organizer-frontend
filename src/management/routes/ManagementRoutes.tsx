import {Navigate, Routes, Route} from 'react-router-dom';

import { CardPage, BoardPage } from '../../management';

export const ManagementRoutes = () => {
  return (
    <Routes>
        <Route path="/" element={<BoardPage />}/>
        <Route path="/cards/:boardId" element={<CardPage />} />
        <Route path="/*" element={<Navigate to="/" />}/>
    </Routes>
  )
}
